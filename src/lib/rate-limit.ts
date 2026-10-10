import { obtenerRedis, redisConfigurado } from "@/lib/redis";

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

const memoria = new Map<string, { count: number; resetAt: number }>();

export function rateLimitRemotoConfigurado(): boolean {
  return (
    redisConfigurado() ||
    Boolean(
      process.env.UPSTASH_REDIS_REST_URL?.trim() &&
        process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
    )
  );
}

export function proveedorRateLimit(): "redis" | "upstash" | "memory" {
  if (redisConfigurado()) return "redis";
  if (
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  ) {
    return "upstash";
  }
  return "memory";
}

function ipDeRequest(request: Request): string {
  // En Vercel el primer valor de x-forwarded-for es el cliente.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "local";
}

export function claveRateLimit(request: Request, bucket: string): string {
  return `${bucket}:${ipDeRequest(request)}`;
}

async function limitarRedisCloud(
  clave: string,
  limite: number,
  ventanaSec: number
): Promise<RateLimitResult | null> {
  const redis = await obtenerRedis();
  if (!redis) return null;

  const redisKey = `rl:${clave}`;
  const count = await redis.incr(redisKey);
  if (count === 1) {
    await redis.expire(redisKey, ventanaSec);
  }
  if (count > limite) {
    return { ok: false, retryAfterSec: ventanaSec };
  }
  return { ok: true };
}

async function limitarUpstash(
  clave: string,
  limite: number,
  ventanaSec: number
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;

  const redisKey = encodeURIComponent(`rl:${clave}`);
  const incrRes = await fetch(`${url}/incr/${redisKey}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!incrRes.ok) return null;
  const incrJson = (await incrRes.json()) as { result?: number };
  const count = Number(incrJson.result ?? 0);
  if (count === 1) {
    await fetch(`${url}/expire/${redisKey}/${ventanaSec}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  }
  if (count > limite) {
    return { ok: false, retryAfterSec: ventanaSec };
  }
  return { ok: true };
}

function limitarMemoria(
  clave: string,
  limite: number,
  ventanaMs: number
): RateLimitResult {
  const ahora = Date.now();
  const actual = memoria.get(clave);
  if (!actual || actual.resetAt <= ahora) {
    memoria.set(clave, { count: 1, resetAt: ahora + ventanaMs });
    return { ok: true };
  }
  actual.count += 1;
  if (actual.count > limite) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((actual.resetAt - ahora) / 1000)) };
  }
  return { ok: true };
}

/** Redis Cloud (REDIS_URL) o Upstash REST; si no hay ninguno, memoria. */
export async function limitarPeticion(
  clave: string,
  limite: number,
  ventanaMs: number
): Promise<RateLimitResult> {
  const ventanaSec = Math.max(1, Math.ceil(ventanaMs / 1000));
  try {
    if (redisConfigurado()) {
      const remoto = await limitarRedisCloud(clave, limite, ventanaSec);
      if (remoto) return remoto;
    }
    const upstash = await limitarUpstash(clave, limite, ventanaSec);
    if (upstash) return upstash;
  } catch (error) {
    console.error("Rate limit remoto falló; uso memoria", error);
  }
  return limitarMemoria(clave, limite, ventanaMs);
}

export function respuestaRateLimit(retryAfterSec: number) {
  return {
    body: { message: "RATE_LIMITED" },
    init: {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    },
  };
}

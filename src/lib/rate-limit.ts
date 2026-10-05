export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

const memoria = new Map<string, { count: number; resetAt: number }>();

function ipDeRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "local";
}

export function claveRateLimit(request: Request, bucket: string): string {
  return `${bucket}:${ipDeRequest(request)}`;
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

/** Upstash si hay credenciales; si no, memoria (útil en local, débil en serverless). */
export async function limitarPeticion(
  clave: string,
  limite: number,
  ventanaMs: number
): Promise<RateLimitResult> {
  const ventanaSec = Math.max(1, Math.ceil(ventanaMs / 1000));
  try {
    const remoto = await limitarUpstash(clave, limite, ventanaSec);
    if (remoto) return remoto;
  } catch {
    // fallback memoria
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

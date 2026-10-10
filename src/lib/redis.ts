import { createClient, type RedisClientType } from "redis";

declare global {
  // eslint-disable-next-line no-var
  var __auraRedis: RedisClientType | undefined;
}

function urlRedis(): string | null {
  const directa = process.env.REDIS_URL?.trim();
  if (directa) return directa;

  const host = process.env.REDIS_HOST?.trim();
  const password = process.env.REDIS_PASSWORD?.trim();
  if (!host || !password) return null;

  const port = process.env.REDIS_PORT?.trim() || "6379";
  const usuario = process.env.REDIS_USERNAME?.trim() || "default";
  // Redis Cloud a veces da redis:// (sin TLS). rediss:// solo si REDIS_TLS=true.
  const proto = process.env.REDIS_TLS === "true" ? "rediss" : "redis";
  return `${proto}://${encodeURIComponent(usuario)}:${encodeURIComponent(password)}@${host}:${port}`;
}

export function redisConfigurado(): boolean {
  return Boolean(urlRedis());
}

/** Cliente singleton (importante en serverless: no abrir 1 conexión por request). */
export async function obtenerRedis(): Promise<RedisClientType | null> {
  const url = urlRedis();
  if (!url) return null;

  if (!globalThis.__auraRedis) {
    const client = createClient({
      url,
      socket: {
        connectTimeout: 5_000,
        reconnectStrategy: (reintentos) => Math.min(reintentos * 200, 2_000),
      },
    });
    client.on("error", (error) => {
      console.error("Redis error", error);
    });
    globalThis.__auraRedis = client as RedisClientType;
  }

  const client = globalThis.__auraRedis;
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

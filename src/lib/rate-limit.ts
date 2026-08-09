const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function excedeRateLimit(clave: string, maximo = RATE_LIMIT_MAX): boolean {
  const ahora = Date.now();
  const actual = rateLimitStore.get(clave) ?? {
    count: 0,
    resetAt: ahora + RATE_LIMIT_WINDOW_MS,
  };

  if (ahora > actual.resetAt) {
    actual.count = 0;
    actual.resetAt = ahora + RATE_LIMIT_WINDOW_MS;
  }

  actual.count += 1;
  rateLimitStore.set(clave, actual);
  return actual.count > maximo;
}

export function obtenerIpCliente(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

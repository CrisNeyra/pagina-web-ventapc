type ErrorContext = Record<string, unknown>;

/**
 * Captura errores hacia Sentry en producción (si hay DSN).
 * En desarrollo solo loguea en consola.
 */
export async function capturarError(error: unknown, contexto?: ErrorContext) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error, contexto);
    return;
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn) return;

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error, contexto ? { extra: contexto } : undefined);
  } catch {
    // Sentry no disponible — no bloquear el flujo.
  }
}

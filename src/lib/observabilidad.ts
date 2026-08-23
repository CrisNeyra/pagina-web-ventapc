type ErrorContext = Record<string, unknown>;

let sentryInicializado = false;

async function inicializarSentry() {
  if (sentryInicializado || typeof window === "undefined") return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn) return;

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    });
    sentryInicializado = true;
  } catch {
    // Sentry no instalado o sin DSN — ignorar en desarrollo.
  }
}

export async function capturarError(error: unknown, contexto?: ErrorContext) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error, contexto);
    return;
  }

  await inicializarSentry();
  if (!sentryInicializado) return;

  const Sentry = await import("@sentry/nextjs");
  Sentry.captureException(error, contexto ? { extra: contexto } : undefined);
}

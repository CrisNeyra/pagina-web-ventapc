# Observabilidad

Salud y errores en producción van por Next (`GET /api/health`, `mode: next-prisma`) y Sentry opcional. Ver [`stack-next-prisma-neon.md`](stack-next-prisma-neon.md).

## Health

`GET /api/health`:

```json
{
  "ok": true,
  "mode": "next-prisma",
  "databaseOk": true,
  "rateLimit": "redis",
  "email": true,
  "timestamp": "..."
}
```

`ok` requiere Postgres. `rateLimit` es `redis` si hay `REDIS_URL`; si no, memoria local.

## Sentry (Next.js)

1. Creá proyecto en [sentry.io](https://sentry.io)
2. En Vercel / `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@o....ingest.sentry.io/...
```

3. Configs: `sentry.client.config.ts`, `sentry.server.config.ts`, `src/instrumentation.ts`
4. Errores de cliente vía `capturarError` en `src/lib/observabilidad.ts` (prod + DSN)

Sin DSN, Sentry queda deshabilitado (sin ruido en local).

Logs del runtime: el panel de Vercel (Functions) para las Route Handlers.

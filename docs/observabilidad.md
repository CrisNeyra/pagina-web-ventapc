# Observabilidad

## Health

`GET /api/health` (Nest):

```json
{
  "ok": true,
  "services": {
    "postgres": true,
    "redis": true,
    "storage": true,
    "storageMode": "local",
    "stripe": false,
    "email": false
  },
  "timestamp": "..."
}
```

`ok` requiere Postgres; Redis solo si `REDIS_URL` está definida.

## Sentry (Next.js)

1. Creá proyecto en [sentry.io](https://sentry.io)
2. En Vercel / `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@o....ingest.sentry.io/...
```

3. Configs: `sentry.client.config.ts`, `sentry.server.config.ts`, `src/instrumentation.ts`
4. Errores de cliente vía `capturarError` en `src/lib/observabilidad.ts` (prod + DSN)

Sin DSN, Sentry queda deshabilitado (sin ruido en local).

## Logs Nest

Usar `Logger` de Nest en servicios (email, storage). En Railway: logs del servicio API.

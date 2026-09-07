# Neon + Railway + Vercel (demo pública)

Stack único: **Next (Vercel) + Nest (Railway) + PostgreSQL (Neon)**.

## 1. Neon

Crear proyecto → copiar `DATABASE_URL` (con `sslmode=require`).

## 2. Railway

1. Deploy desde GitHub, **Root Directory** = `api`
2. Variables mínimas:
   - `DATABASE_URL` (Neon)
   - `JWT_SECRET` (largo, aleatorio)
   - `CORS_ORIGINS=https://pagina-web-ventapc.vercel.app,http://localhost:3000`
   - `ADMIN_EMAILS=admin@aurapro.com`
   - `NODE_ENV=production`
3. Opcionales: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `PUBLIC_SITE_URL`, `REDIS_URL`, MinIO/S3 (ver [`storage-cloud.md`](storage-cloud.md))
4. Generate Domain → probar `/api/health` (`ok: true`, `services.postgres: true`)
5. Seed corre en `npm run start:cloud` (admin `admin@aurapro.com` / `1234ab`)

## 3. Vercel

```
NEXT_PUBLIC_API_URL=https://TU-DOMINIO.up.railway.app/api
NEXT_PUBLIC_USE_API_CATALOG=true
NEXT_PUBLIC_SITE_URL=https://pagina-web-ventapc.vercel.app
# Opcional
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SENTRY_DSN=
```

Redeploy.

## Checklist

- [ ] `GET /api/health` → `ok: true`
- [ ] Login / registro en el sitio
- [ ] Checkout efectivo o transferencia
- [ ] Guardar build en Armá tu PC
- [ ] (Opcional) Emails Resend, Stripe webhook, Sentry

Más detalle de seguridad: [`seguridad-api.md`](seguridad-api.md).

# Seguridad API (JWT, Stripe, rate limit)

## JWT

- Login / registro emiten Bearer JWT (`Authorization: Bearer …`).
- Cookie de sesión front: `aura_token` (misma firma, `JWT_SECRET`).
- Rotá `JWT_SECRET` en producción; no reutilices el valor de desarrollo.
- Rutas admin: `JwtAuthGuard` + `AdminGuard` (`ADMIN_EMAILS`).

## Stripe webhook

- Endpoint: `POST /api/payments/stripe/webhook`
- Verifica firma con `STRIPE_WEBHOOK_SECRET` y `rawBody` (Nest `rawBody: true`).
- Exento de Throttler (`@SkipThrottle`) para no rechazar reintentos de Stripe.
- Sin secret → `WEBHOOK_NO_CONFIGURADO`.

Config local típica:

```bash
stripe listen --forward-to localhost:4000/api/payments/stripe/webhook
```

## Rate limiting

- Global: `ThrottlerGuard` — **60 req / 60s** por IP (Nest).
- Adicional por Redis (si hay `REDIS_URL`): pedidos, Stripe intent, postulaciones.
- Health: `@SkipThrottle`.

## Checklist producción

- [ ] `JWT_SECRET` fuerte y único
- [ ] `CORS_ORIGINS` solo dominios reales
- [ ] Stripe keys + webhook secret en Railway
- [ ] `ADMIN_EMAILS` acotado
- [ ] HTTPS en Vercel + Railway

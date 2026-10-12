# Seguridad API (JWT, Mercado Pago, rate limit)

> **Legacy Nest / stack actual:** el camino diario es Next.js + Route Handlers en `/api` (Prisma + Neon). Nest (`api/`) solo con `NEXT_PUBLIC_API_URL`. Ver [`stack-next-prisma-neon.md`](stack-next-prisma-neon.md).

## JWT

- Login / registro emiten Bearer JWT (`Authorization: Bearer …`).
- Cookie de sesión front: `aura_token` (misma firma, `JWT_SECRET`).
- Rotá `JWT_SECRET` en producción; no reutilices el valor de desarrollo.
- Rutas admin: `JwtAuthGuard` + `AdminGuard` (`ADMIN_EMAILS`).

## Mercado Pago webhook

- Endpoint: `POST /api/payments/mercadopago/webhook` (también admite GET IPN).
- Access Token solo en servidor (`MERCADOPAGO_ACCESS_TOKEN`).
- Consulta el pago en la API de MP antes de marcar el pedido.

## Rate limiting

- Global: `ThrottlerGuard` — **60 req / 60s** por IP (Nest).
- Adicional por Redis (si hay `REDIS_URL`): pedidos, preferencia Mercado Pago, postulaciones.
- Health: `@SkipThrottle`.

## Checklist producción

- [ ] `JWT_SECRET` fuerte y único
- [ ] `CORS_ORIGINS` solo dominios reales
- [ ] Credenciales de Mercado Pago (prueba) en Vercel
- [ ] `ADMIN_EMAILS` acotado
- [ ] HTTPS en Vercel + Railway

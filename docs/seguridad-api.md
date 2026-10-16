# Seguridad API (JWT, Mercado Pago, rate limit)

El camino diario es Next.js + Route Handlers en `/api` (Prisma + Neon). Ver [`stack-next-prisma-neon.md`](stack-next-prisma-neon.md).

## JWT

- Login / registro setean la cookie httpOnly `aura_token` (`JWT_SECRET`).
- Rotá `JWT_SECRET` en producción; no reutilices el valor de desarrollo.
- Rutas admin: sesión válida + rol admin (`ADMIN_EMAIL` / `ADMIN_EMAILS`).

## Mercado Pago webhook

- Endpoint: `POST /api/payments/mercadopago/webhook` (también admite GET IPN).
- Access Token solo en servidor (`MERCADOPAGO_ACCESS_TOKEN`).
- Si definís `MERCADOPAGO_WEBHOOK_SECRET`, el handler exige `x-signature` válida (HMAC). Sin esa variable el aviso se procesa igual.
- Consulta el pago en la API de MP antes de marcar el pedido.

## Rate limiting

- Redis (`REDIS_URL`) en pedidos, preferencia Mercado Pago, auth y postulaciones.
- Sin Redis, el límite queda en memoria del proceso.

## Checklist producción

- [ ] `JWT_SECRET` fuerte y único
- [ ] Credenciales de Mercado Pago (prueba) en Vercel
- [ ] `MERCADOPAGO_WEBHOOK_SECRET` del panel de webhooks
- [ ] `ADMIN_EMAILS` acotado
- [ ] HTTPS en Vercel

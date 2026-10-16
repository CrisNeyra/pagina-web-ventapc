# API — Aura Pro

La API vive en las Route Handlers de Next, bajo `src/app/api`, y se publica en el mismo deploy (`/api`).

| Área | Rutas |
|------|--------|
| Salud | `GET /api/health` |
| Auth | `src/app/api/auth/*` |
| Catálogo | `GET /api/products` |
| Pedidos | `POST /api/orders`, `GET /api/orders/me` |
| Mercado Pago | `src/app/api/payments/mercadopago/*` |
| Admin | `src/app/api/admin/*` |
| PC builds | `src/app/api/pc-builds/*` |
| Postulaciones | `POST /api/postulaciones` |

Guías: [`stack-next-prisma-neon.md`](stack-next-prisma-neon.md) · [`seguridad-api.md`](seguridad-api.md) · [`mercadopago.md`](mercadopago.md).

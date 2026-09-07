# Backend API — Aura Pro

API NestJS + PostgreSQL (+ Redis/MinIO opcionales) para catálogo, auth JWT, pedidos, stock, admin y postulaciones.

## Desarrollo local

```bash
npm run catalogo:export:api
docker compose up -d postgres redis minio
cd api
cp .env.example .env
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

API: `http://localhost:4000/api`.

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado (ok si Postgres OK; storageMode local\|minio) |
| GET | `/products` | Catálogo |
| POST | `/orders` | Pedido offline (JWT) |
| GET | `/orders/me` | Pedidos del usuario |
| POST | `/payments/stripe/intent` | PaymentIntent Stripe |
| POST | `/payments/stripe/webhook` | Webhook Stripe |
| POST | `/auth/register` | Registro |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Usuario actual |
| POST | `/pc-builds` | Guardar build (JWT) |
| GET | `/pc-builds/me` | Builds del usuario |
| GET | `/admin/orders` | Pedidos admin |
| GET | `/admin/postulaciones/:id/cv` | Descargar CV (PDF, JWT admin) |
| POST | `/postulaciones` | Postulación + CV |

## Auth

Solo JWT Nest. Rate limit global (Throttler 60/min) + Redis en rutas sensibles.

## Emails

Con `RESEND_API_KEY` + `EMAIL_FROM`: confirmación de pedido (offline + Stripe paid) y postulación.

## Docs relacionadas

- [`demo-cloud.md`](demo-cloud.md)
- [`storage-cloud.md`](storage-cloud.md)
- [`seguridad-api.md`](seguridad-api.md)
- [`observabilidad.md`](observabilidad.md)

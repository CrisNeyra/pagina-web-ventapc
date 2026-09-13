# Backend API — Aura Pro (Nest LEGACY)

> **Stack actual:** Next.js + Prisma + Neon. Ver [`stack-next-prisma-neon.md`](stack-next-prisma-neon.md).  
> La carpeta `api/` es **legacy**. Auth, catálogo, pedidos, Stripe, admin, PC builds y postulaciones ya viven en `src/app/api`.

Usá Nest solo como referencia o escape hatch con `NEXT_PUBLIC_API_URL`.

## Arranque legacy (opcional)

```bash
npm run catalog:export:api
docker compose up -d postgres redis minio
cd api
cp .env.example .env
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

API: `http://localhost:4000/api`.

## Endpoints (históricos)

Los mismos paths existen hoy en Next bajo `/api/...` (mismo origen). Esta tabla documenta el Nest original.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health |
| GET | `/products` | Catálogo |
| POST | `/orders` | Pedido offline (JWT) |
| GET | `/orders/me` | Pedidos del usuario |
| POST | `/payments/stripe/intent` | PaymentIntent |
| POST | `/payments/stripe/webhook` | Webhook Stripe |
| POST | `/auth/register` | Registro |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Usuario actual |
| POST | `/pc-builds` | Guardar build (JWT) |
| GET | `/pc-builds/me` | Builds del usuario |
| GET | `/admin/orders` | Pedidos admin |
| GET | `/admin/postulaciones/:id/cv` | CV PDF |
| POST | `/postulaciones` | Postulación + CV |

Más: [`seguridad-api.md`](seguridad-api.md) · [`api/README.md`](../api/README.md).

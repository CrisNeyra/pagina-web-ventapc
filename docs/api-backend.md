# Backend API — Aura Pro (Nest LEGACY)

> **Stack actual:** Next.js + Prisma + Neon. Ver [`stack-next-prisma-neon.md`](stack-next-prisma-neon.md).  
> La carpeta `api/` es **legacy**. Auth, catálogo, pedidos, Mercado Pago, admin, PC builds y postulaciones ya viven en `src/app/api`.

**No uses Nest en el flujo diario.** No setees `NEXT_PUBLIC_API_URL`. La carpeta `api/` queda como referencia (pedidos/admin viejos). Scripts: `npm run api:legacy:install` / `npm run api:legacy:dev` (solo comparación histórica).

## Arranque legacy (solo si comparás código viejo)

```bash
npm run catalogo:export:api
docker compose up -d postgres redis minio
cp api/.env.example api/.env
npm run api:legacy:install
cd api && npx prisma migrate deploy && npm run prisma:seed
npm run api:legacy:dev
```

API Nest: `http://localhost:4000/api`. El día a día es `npm run dev` (Next en `:3000`).

## Endpoints (históricos)

Los mismos paths existen hoy en Next bajo `/api/...` (mismo origen). Esta tabla documenta el Nest original.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health |
| GET | `/products` | Catálogo |
| POST | `/orders` | Pedido offline (JWT) |
| GET | `/orders/me` | Pedidos del usuario |
| POST | `/payments/mercadopago/preference` | Checkout Pro (Next) |
| POST | `/payments/mercadopago/webhook` | Webhook Mercado Pago (Next) |
| POST | `/auth/register` | Registro |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Usuario actual |
| POST | `/pc-builds` | Guardar build (JWT) |
| GET | `/pc-builds/me` | Builds del usuario |
| GET | `/admin/orders` | Pedidos admin |
| GET | `/admin/postulaciones/:id/cv` | CV PDF |
| POST | `/postulaciones` | Postulación + CV |

Más: [`seguridad-api.md`](seguridad-api.md) · [`api/README.md`](../api/README.md).

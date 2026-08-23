# Backend API — Aura Pro

API NestJS + PostgreSQL + Redis + MinIO para catálogo, pedidos, stock, admin y postulaciones.

## Desarrollo local

```bash
# 1. Exportar catálogo desde Next.js
npm run catalogo:export:api

# 2. Levantar infraestructura
docker compose up -d postgres redis minio

# 3. Instalar y migrar API
cd api
cp .env.example .env
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

La API queda en `http://localhost:4000/api`.

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado de postgres, redis, minio, stripe |
| GET | `/products` | Catálogo con filtros |
| POST | `/orders` | Crear pedido offline (JWT) |
| POST | `/payments/stripe/intent` | PaymentIntent Stripe |
| POST | `/payments/stripe/webhook` | Webhook Stripe |
| GET | `/shipping/quote?cp=` | Cotizar envío por CP |
| GET | `/site-config/transferencia` | Datos bancarios |
| POST | `/auth/register` | Registro email/password (JWT) |
| POST | `/auth/login` | Login Nest (JWT) |
| GET | `/auth/me` | Usuario actual (JWT) |
| POST | `/auth/firebase-exchange` | Puente Firebase → JWT (legacy; apagar con `DISABLE_FIREBASE_EXCHANGE=true`) |
| GET | `/admin/orders` | Pedidos pendientes (admin) |
| PATCH | `/admin/orders/:id` | Actualizar estado pedido |

## Auth Nest vs Firebase

- Frontend: `NEXT_PUBLIC_AUTH_MODE=nest` (default si hay `NEXT_PUBLIC_API_URL`) usa register/login/me.
- `NEXT_PUBLIC_AUTH_MODE=firebase` mantiene Auth Firebase + exchange a JWT.
- Migrar emails Firebase → PG (sin password): `cd api && npm run users:migrate-firebase` (`--dry-run` opcional).

## Producción (VPS)

```bash
docker compose --profile production up -d
```

Configurá `deploy/Caddyfile` con tu dominio y variables en `.env`.

## Backup Postgres

```bash
docker compose exec postgres pg_dump -U aurapro aurapro > backup.sql
```

## Migración Firestore → PostgreSQL (pedidos)

### 1. Exportar desde Firestore

```bash
# Desde la raíz del proyecto (con FIREBASE_SERVICE_ACCOUNT_JSON configurada)
node scripts/export-firestore-orders.mjs > orders-export.json
```

### 2. Importar a PostgreSQL

```bash
cd api
npm run orders:import -- ../orders-export.json --dry-run   # vista previa
npm run orders:import -- ../orders-export.json             # import real
```

El import omite pedidos duplicados y aquellos cuyos `product_id` no existan en el catálogo PG (corré el seed antes).


# Prueba: login Firebase + checkout vía API Nest

Checklist local para validar la Fase A (Firebase Auth se mantiene; pedidos van a PostgreSQL vía Nest).

## Prerrequisitos

### Terminales

1. **Docker Desktop** con engine running
2. Infra:

```powershell
cd "D:\Devs\Pagina web ventaPC"
docker compose up -d postgres redis minio
docker compose ps
```

3. **API** (`api/`):

```powershell
cd api
npm run start:dev
```

4. **Frontend** (raíz):

```powershell
cd "D:\Devs\Pagina web ventaPC"
npm run dev
```

### Variables

**`api/.env`** (mínimo):

```env
DATABASE_URL=postgresql://aurapro:aurapro_dev@localhost:5432/aurapro?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_jwt_secret_change_in_production
FIREBASE_SERVICE_ACCOUNT_JSON={...mismo JSON que el front...}
ADMIN_EMAILS=admin@aurapro.com
```

**Raíz `.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_USE_API_CATALOG=true
NEXT_PUBLIC_AUTH_MODE=firebase
FIREBASE_SERVICE_ACCOUNT_JSON={...}
NEXT_PUBLIC_FIREBASE_* = ...
```

`NEXT_PUBLIC_AUTH_MODE=firebase` = login Firebase + exchange a JWT Nest (Fase A).  
`NEXT_PUBLIC_AUTH_MODE=nest` = login/register nativos Nest (Fase B).

## Verificación rápida

```powershell
Invoke-RestMethod http://localhost:4000/api/health
Invoke-RestMethod http://localhost:4000/api/products
```

Health debe mostrar postgres/redis OK.

## Flujo manual E2E

1. Abrí http://localhost:3000
2. Iniciá sesión (usuario Firebase existente)
3. DevTools → Application → Local Storage → debe existir `aura-pro-api-token`
4. Si el exchange falla, verás un toast de advertencia (modo dev)
5. Agregá un producto → carrito → checkout
6. Elegí **efectivo** o **transferencia** y confirmá
7. Network: `POST http://localhost:4000/api/orders` → **201**
8. No debe crearse documento nuevo en Firestore `pedidos` para ese checkout
9. (Opcional) tarjeta: `POST .../payments/stripe/intent` (requiere `STRIPE_SECRET_KEY` en API)

## Admin

1. Login con email en `ADMIN_EMAILS`
2. Tras exchange, el JWT debe tener `role: admin`
3. `/admin` lista pedidos desde Nest (`GET /admin/orders`)

## Fallos comunes

| Síntoma | Causa |
|---------|--------|
| Sin `aura-pro-api-token` | API caída o falta `FIREBASE_SERVICE_ACCOUNT_JSON` en `api/.env` |
| Checkout “Debés iniciar sesión” | Exchange falló; revisá toast/consola |
| Stripe pide Cloud Function | Con API configurada ya no hace falta; reiniciá `npm run dev` |
| Proxy no redirige a login | Falta `FIREBASE_SERVICE_ACCOUNT_JSON` en Next (modo firebase) o cookie `aura_token` (modo nest) |

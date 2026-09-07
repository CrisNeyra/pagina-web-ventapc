# Prueba: login + checkout vía API Nest

## Prerrequisitos

Docker (postgres/redis/minio) + `cd api && npm run start:dev` + `npm run dev` en la raíz.

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_USE_API_CATALOG=true
```

## Flujo

1. Registro o login (`admin@aurapro.com` / `1234ab` tras seed)
2. localStorage: `aura-pro-api-token`
3. Checkout efectivo/transferencia → `POST /orders` 201
4. Armá tu PC → guardar → `POST /pc-builds`
5. (Opcional) tarjeta → `POST /payments/stripe/intent`

## Fallos comunes

| Síntoma | Causa |
|---------|--------|
| Banner “API no responde” | Nest caído |
| Checkout sin sesión | Falta token / cookie `aura_token` |
| Stripe no disponible | Falta publishable key o API URL |

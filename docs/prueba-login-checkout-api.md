# Prueba: login + checkout (Next `/api` o Nest legacy)

## Recomendado (Next + Neon)

```env
DATABASE_URL=postgresql://...neon.tech/...?sslmode=require
JWT_SECRET=secreto-largo
```

```bash
npm run db:setup
npm run dev
```

Probar en el browser: registro/login → carrito → checkout efectivo/transferencia → `/admin`.

## Legacy (Nest externo)

Solo si querés validar Nest aparte:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_USE_API_CATALOG=true
```

Docker + `cd api && npm run start:dev`, luego el e2e `e2e/nest-api.spec.ts`.

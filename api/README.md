# Nest API — Aura Pro (LEGACY)

> **Stack actual:** Next.js + Prisma + Neon en la raíz.  
> Guía: [`stack-next-prisma-neon.md`](../docs/stack-next-prisma-neon.md)

Esta carpeta `api/` es el backend **NestJS legacy**. Ya no hace falta para el día a día: auth, catálogo, pedidos, Stripe, admin, PC builds y postulaciones viven en `src/app/api`.

## Cuándo usarla

Solo si querés comparar implementaciones o forzar el front a Nest con:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Arranque legacy (opcional)

```bash
# Infra local (Docker) o Neon
cd api
cp .env.example .env
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

API: `http://localhost:4000/api`. Docs históricas: [`docs/api-backend.md`](../docs/api-backend.md).

## Limpieza futura

Candidata a retirar cuando no haga falta el escape hatch Nest. No borrar en caliente sin confirmar que ningún deploy/e2e depende de ella.

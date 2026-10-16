# ADR-001 — Arquitectura Aura Pro (Next + Prisma + Neon)

## Contexto

Aura Pro es un e-commerce de portfolio. El stack es **Next.js (App Router) + TypeScript + Prisma + PostgreSQL (Neon)** en un solo runtime/deploy.

## Decisiones

### Un solo runtime (Next)
- UI en `src/app`.
- API en Route Handlers (`src/app/api/...`).

### Auth JWT en Next
- Register / login / me en `src/app/api/auth/*`.
- Cookie httpOnly `aura_token` + Bearer en cliente.
- `JWT_SECRET` solo en servidor.

### Datos en PostgreSQL (Prisma en la raíz)
- Schema en `prisma/`; cliente en `src/lib/prisma.ts`.
- Users, products, orders, pc_builds, postulaciones, site_config, shipping.

### Mercado Pago
- Access Token y webhook en Route Handlers (`/api/payments/mercadopago/*`). El checkout muestra tarjeta si el servidor tiene `MERCADOPAGO_ACCESS_TOKEN`.

### Sin Firebase / Supabase
- Eliminados Auth, Firestore, Cloud Functions y carpeta `supabase/`.

## Consecuencias

- Día a día: `npm run dev` + Neon (`docs/stack-next-prisma-neon.md`).
- Deploy: Vercel + Neon. Docker no forma parte del flujo.

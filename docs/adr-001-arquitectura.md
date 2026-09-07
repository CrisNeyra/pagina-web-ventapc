# ADR-001 — Arquitectura Aura Pro (Nest-only)

## Contexto

Aura Pro es un e-commerce de portfolio. El stack único es **Next.js (Vercel) + NestJS + PostgreSQL**.

## Decisiones

### Auth JWT Nest
- Register / login / me en la API.
- Cookie httpOnly `aura_token` + Bearer en cliente.

### Datos en PostgreSQL (Prisma)
- Users, products, orders, pc_builds, postulaciones, site_config, shipping.

### Stripe vía Nest
- `POST /payments/stripe/intent` y webhook en la API.
- Front solo usa publishable key + Elements.

### Sin Firebase / Supabase
- Eliminados Auth, Firestore, Cloud Functions y carpeta `supabase/`.

## Consecuencias

- Deploy demo: Vercel + Railway + Neon (`docs/demo-cloud.md`).
- Local: Docker para Postgres (+ Redis/MinIO opcionales).

# Neon + Vercel (stack actual)

## Recomendado: Next + Prisma + Neon

Un solo deploy en **Vercel**; la base en **Neon**. No hace falta Railway ni Docker.

Guía: [`stack-next-prisma-neon.md`](stack-next-prisma-neon.md).

### Resumen

1. **Neon** — proyecto → `DATABASE_URL` (`sslmode=require`).
2. **Local** — `.env.local` con `DATABASE_URL` + `JWT_SECRET` → `npm run db:setup` → `npm run dev`.
3. **Vercel** — mismas vars + `NEXT_PUBLIC_SITE_URL` (+ Stripe si aplica).

Checklist:

- [ ] `GET /api/health` → `ok: true`, `mode: "next-prisma"`
- [ ] Login / registro
- [ ] Catálogo desde DB
- [ ] Pedido offline / admin
- [ ] (Opcional) Stripe con keys de test

---

## Legacy: Nest externo

La carpeta `api/` ya no es necesaria para el flujo diario. Solo si querés forzar Nest:

```
NEXT_PUBLIC_API_URL=https://TU-DOMINIO.up.railway.app/api
```

Ver [`api-backend.md`](api-backend.md) y [`api/README.md`](../api/README.md).

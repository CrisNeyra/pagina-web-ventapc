# Deploy: Vercel + Neon

Checklist para publicar Aura Pro (Next App Router + Prisma + Neon).

```
GitHub ──push──► Vercel (Next.js + /api Route Handlers)
                     │
                     │ Prisma
                     ▼
                   Neon (PostgreSQL)
```

## 1. Neon

1. [console.neon.tech](https://console.neon.tech) → proyecto (ej. `aurapro`).
2. **Connect** → copiá `DATABASE_URL` (direct, `sslmode=require`).
3. Desde tu PC (una vez, o tras cambios de schema):

```bash
# Con DATABASE_URL en .env / .env.local
npm run db:migrate
npm run db:seed
```

Admin tras seed: `admin@aurapro.com` / `1234ab`.

## 2. Variables en Vercel

Project → **Settings → Environment Variables** (Production + Preview):

| Variable | Obligatoria | Notas |
|----------|-------------|--------|
| `DATABASE_URL` | Sí | Connection string Neon |
| `JWT_SECRET` | Sí | Secreto largo (≥32 chars), solo servidor |
| `NEXT_PUBLIC_SITE_URL` | Sí | `https://tu-proyecto.vercel.app` (o dominio custom) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Solo si usás Stripe |
| `STRIPE_SECRET_KEY` | No | Solo servidor |
| `STRIPE_WEBHOOK_SECRET` | No | Tras crear endpoint en Stripe Dashboard |
| `ADMIN_EMAILS` | No | CSV de emails admin extra |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Observabilidad |

No hace falta `NEXT_PUBLIC_API_URL` (el cliente usa `/api` del mismo origen).

## 3. Conectar el repo a Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → importá `CrisNeyra/pagina-web-ventapc` (o tu fork).
2. **Root Directory:** `.` (raíz; no `api/`).
3. Framework: Next.js (auto).
4. Build Command: `prisma generate && next build` (ya está en `package.json` → `npm run build`).
5. Install: `npm install` (también corre `postinstall` → `prisma generate`).
6. Pegá las variables del paso 2 → **Deploy**.

Si el proyecto **ya existe** en Vercel: cargá/actualizá las env vars → **Redeploy**.

## 4. Post-deploy

1. Abrí `https://TU-DOMINIO/api/health`  
   Esperado: `ok: true`, `mode: "next-prisma"`.
2. Login admin / catálogo / un pedido efectivo de prueba.
3. (Opcional) Stripe webhook:  
   `https://TU-DOMINIO/api/payments/stripe/webhook`  
   Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`.

## 5. Push del código nuevo

En esta máquina hay muchos cambios locales (migración Nest → Next) **sin pushear**. Sin push, Vercel sigue el commit viejo.

```bash
git add -A
git status   # revisá que no entre .env.local
git commit -m "feat: Next+Prisma+Neon como stack único (API en Route Handlers)"
git push origin main
```

Si `git` se queja de *dubious ownership*:

```bash
git config --global --add safe.directory "D:/Devs/Pagina web ventaPC"
```

## Troubleshooting

| Síntoma | Qué mirar |
|---------|-----------|
| Build falla en `prisma generate` | `DATABASE_URL` no es necesaria en build si solo generás client; igual conviene tenerla. Revisá logs. |
| `/api/health` → DB fail | `DATABASE_URL` mal pegada; IP allow / Neon slept (wake on first query). |
| Login 503 | Falta `JWT_SECRET` en Vercel. |
| 404 en `/api/...` | Redeploy tras push; Root Directory no debe ser `api/`. |

Más contexto: [`stack-next-prisma-neon.md`](stack-next-prisma-neon.md).

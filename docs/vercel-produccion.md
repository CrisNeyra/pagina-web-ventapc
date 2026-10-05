# Deploy: Vercel + Neon

Checklist para publicar Aura Pro (Next App Router + Prisma + Neon).

```
GitHub ──push──► Vercel (Next.js + /api Route Handlers)
                     │
                     │ Prisma
                     ▼
    10|                   Neon (PostgreSQL)
```

Código de la migración ya está en `main` (a partir de `dc35251`). Si `/api/health` da 404, Vercel todavía no redeployó o faltan env vars.

## 1. Neon

1. [console.neon.tech](https://console.neon.tech) → proyecto (ej. `aurapro`).
2. **Connect** → copiá `DATABASE_URL` (direct, `sslmode=require`).
3. Desde tu PC (una vez, o tras cambios de schema):

```bash
# Con DATABASE_URL y ADMIN_PASSWORD en .env.local
npm run db:migrate
npm run db:seed
```

`ADMIN_PASSWORD` es obligatorio (mín. 10 caracteres, letra y número).

## 2. Variables en Vercel

Project → **Settings → Environment Variables** (Production + Preview):

| Variable | Obligatoria | Notas |
|----------|-------------|--------|
| `DATABASE_URL` | Sí | Connection string Neon |
| `JWT_SECRET` | Sí | Secreto largo (≥32 chars), solo servidor |
| `NEXT_PUBLIC_SITE_URL` | Sí | `https://pagina-web-ventapc.vercel.app` |
| `GOOGLE_CLIENT_ID` | Para login Google | ID de cliente OAuth (aplicación web). No va al repo |
| `GOOGLE_CLIENT_SECRET` | Para login Google | Secreto del mismo cliente. Solo servidor |
| `BLOB_READ_WRITE_TOKEN` | CVs en prod | Vercel Blob; sin esto los PDF no persisten |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Rate-limit prod | Login/register/postulaciones |
| `RESEND_API_KEY` + `EMAIL_FROM` | Emails | Pedidos y postulaciones |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Solo si usás Stripe |
| `STRIPE_SECRET_KEY` | No | Solo servidor |
| `STRIPE_WEBHOOK_SECRET` | No | Endpoint: `/api/payments/stripe/webhook` |
| `ADMIN_EMAILS` | No | CSV de emails admin extra |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Observabilidad |

**No** setees `NEXT_PUBLIC_API_URL` (el cliente debe usar `/api` del mismo origen).

Login con Google: en [Google Cloud](https://console.cloud.google.com/) → Credenciales → cliente OAuth web, registrá estos redirect exactos:

- `http://localhost:3000/api/auth/google/callback`
- `https://pagina-web-ventapc.vercel.app/api/auth/google/callback`

Mientras la pantalla de consentimiento esté en “Prueba”, el Gmail tiene que estar en **Usuarios de prueba**.

## 3. Conectar el repo a Vercel

1. [vercel.com](https://vercel.com) → proyecto `pagina-web-ventapc`.
2. **Root Directory:** `.` (raíz; no `api/`).
3. Framework: Next.js (auto).
4. Build: `npm run build` (`prisma generate && next build`).
5. Pegá las variables del paso 2 → **Redeploy** (sin cache si el build anterior falló).

## 4. Post-deploy

1. `https://TU-DOMINIO/api/health` → `ok: true`, `mode: "next-prisma"`.
2. Login admin / catálogo / un pedido efectivo de prueba.
3. Stripe webhook (opcional): `https://TU-DOMINIO/api/payments/stripe/webhook`.

## Troubleshooting

| Síntoma | Qué mirar |
|---------|-----------|
| `/api/health` 404 | Deploy viejo o Root Directory = `api/` |
| `/api/health` DB fail | `DATABASE_URL` mal pegada; Neon slept |
| Login 503 | Falta `JWT_SECRET` |
| CVs desaparecen | Falta `BLOB_READ_WRITE_TOKEN` |

Más contexto: [`stack-next-prisma-neon.md`](stack-next-prisma-neon.md).

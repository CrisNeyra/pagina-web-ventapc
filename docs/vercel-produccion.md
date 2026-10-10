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
| `REDIS_URL` (o `REDIS_HOST` + `REDIS_PORT` + `REDIS_PASSWORD`) | Rate limit | Preferido: [Redis Cloud](https://app.redislabs.com) free. El CLI suele dar `redis://` (sin TLS); si exige TLS usá `rediss://`. `/api/health` → `rateLimit: "redis"`. Alternativa: Upstash REST |
| `RESEND_API_KEY` + `EMAIL_FROM` | Emails | Pedidos, restablecer contraseña y postulaciones. Prueba: `Aura Pro <onboarding@resend.dev>` (solo llega al dueño de la cuenta Resend). Clientes reales: dominio verificado en Resend — ver sección «Correo con dominio propio» |
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

Para que entre cualquier Gmail, en el proyecto `aurapro-27727` → **APIs y servicios → Pantalla de consentimiento de OAuth**:

1. Política de privacidad: `https://pagina-web-ventapc.vercel.app/privacidad`. Dominio autorizado: `pagina-web-ventapc.vercel.app`.
2. **Publicar app** (salir de Prueba). Con los scopes `openid email profile`, Google deja entrar a cualquier Gmail y puede mostrar «app no verificada» hasta la verificación de marca.
3. Probá el botón en local y en Vercel con un Gmail que no esté en usuarios de prueba.

Ese clic de publicar se hace en Google Cloud Console; el código no lo puede hacer solo.

## Correo con dominio propio (Resend)

`onboarding@resend.dev` solo entrega a la casilla de la cuenta Resend. Para mails a clientes:

1. Comprá un dominio (Namecheap, Cloudflare Registrar, Google Domains / Squarespace, etc.). No sirve `*.vercel.app`.
2. En [resend.com/domains](https://resend.com/domains) → **Add Domain** → tu dominio (ej. `aurapro.com`).
3. Resend muestra registros DNS (MX/TXT/CNAME según el panel). Copialos en el DNS del registrador.
4. Esperá a que el dominio pase a **Verified** (minutos a unas horas).
5. Cambiá `EMAIL_FROM` a algo del dominio, por ejemplo:
   `Aura Pro <hola@aurapro.com>`
   o `Aura Pro <noreply@aurapro.com>`.
6. Actualizá la variable en `.env.local` y en Vercel → Redeploy.
7. Probá «Olvidé mi contraseña» con un Gmail tuyo que no sea el de Resend: tiene que llegar el mail.

Opcional: apuntá ese dominio a Vercel (CNAME/`A`) para que el sitio deje de ser solo `pagina-web-ventapc.vercel.app`. Eso también ayuda a Google (marca / dominio autorizado).

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

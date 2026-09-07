# Vercel + GitHub + Backend cloud

```
GitHub ──push──► Vercel (Next.js)
                     │
                     │ NEXT_PUBLIC_API_URL
                     ▼
              Railway (Nest) ──► Neon (PostgreSQL)
```

Guía paso a paso: [`demo-cloud.md`](demo-cloud.md).

## Variables Vercel (Production / Preview)

| Variable | Ejemplo |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://tu-api.up.railway.app/api` |
| `NEXT_PUBLIC_USE_API_CATALOG` | `true` |
| `NEXT_PUBLIC_SITE_URL` | `https://pagina-web-ventapc.vercel.app` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` / `pk_test_...` |

Tras cambiar vars: Redeploy.

## API (Railway)

`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS=https://pagina-web-ventapc.vercel.app`, `ADMIN_EMAILS`, opcional Stripe/MinIO/Redis.

Sin `NEXT_PUBLIC_API_URL` el front no autentica ni hace pedidos (Nest es obligatorio).

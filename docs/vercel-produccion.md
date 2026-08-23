# Vercel + GitHub + Backend VPS

Cómo se relacionan el frontend (Vercel), el código (GitHub) y el backend Docker (VPS o local).

## Arquitectura

```
GitHub (repo) ──push main──► GitHub Actions (CI: lint, test, build)
                │
                └──auto-deploy──► Vercel (Next.js frontend)
                                        │
                                        │ NEXT_PUBLIC_API_URL
                                        ▼
                                 VPS Docker (NestJS + PostgreSQL)
```

| Componente | Dónde corre | Se despliega con push a GitHub? |
|------------|-------------|----------------------------------|
| Next.js (`src/`) | Vercel | Sí — automático si el repo está conectado |
| API NestJS (`api/`) | Docker en VPS o PC local | No — deploy manual en el servidor |
| PostgreSQL, Redis, MinIO | Docker | No |

## GitHub

- **Repo:** https://github.com/CrisNeyra/pagina-web-ventapc
- **CI:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) corre en cada push/PR a `main`
- El CI **no** levanta Docker ni la API; solo valida el frontend y Functions

## Vercel (frontend)

**URL producción:** https://pagina-web-ventapc.vercel.app

### Modo actual (sin API en producción)

Sin `NEXT_PUBLIC_API_URL` en Vercel, el sitio usa:
- Firebase Auth
- Firestore (pedidos, builds)
- Catálogo estático (fallback)

Esto es seguro: el push a GitHub no rompe producción.

### Modo con API en VPS

Cuando tengas la API en un VPS con HTTPS:

1. **Vercel → Project → Settings → Environment Variables**

| Variable | Valor ejemplo | Entornos |
|----------|---------------|----------|
| `NEXT_PUBLIC_API_URL` | `https://api.tudominio.com/api` | Production, Preview |
| `NEXT_PUBLIC_USE_API_CATALOG` | `true` | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://pagina-web-ventapc.vercel.app` | Production |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://...@sentry.io/...` | Production (opcional) |

2. **En el VPS** (`api/.env`):

```env
CORS_ORIGINS=https://pagina-web-ventapc.vercel.app,http://localhost:3000
JWT_SECRET=tu_secreto_largo
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

3. Editá [`deploy/Caddyfile`](../deploy/Caddyfile) con tu dominio real.

4. En el VPS:

```bash
docker compose --profile production up -d
```

5. **Redeploy** en Vercel (Deployments → ⋯ → Redeploy) para que tome las nuevas variables.

### Variables que siguen en Vercel (Firebase)

Mientras dure la migración gradual, mantené también:

- `NEXT_PUBLIC_FIREBASE_*`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Checklist post-push

1. GitHub Actions en verde
2. Vercel deployment exitoso
3. Si agregaste `NEXT_PUBLIC_API_URL`, verificá `/api/health` desde el navegador de la API
4. Probar `/productos` y `/admin` en producción

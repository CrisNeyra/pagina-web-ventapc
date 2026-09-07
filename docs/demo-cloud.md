# Neon + Railway + Vercel (demo pública para reclutadores)
#
# Objetivo: front 24/7 en Vercel + API Nest + Postgres en la nube.
# Docker en tu PC solo sirve para desarrollo local.

## Arquitectura

```
Reclutador → https://pagina-web-ventapc.vercel.app (Next.js)
                │
                │ NEXT_PUBLIC_API_URL
                ▼
         Railway (Nest api/)  →  Neon (PostgreSQL)
```

Redis y MinIO son **opcionales** en demo. Sin Redis el health sigue `ok` si Postgres responde; rate-limit Redis se desactiva. Sin MinIO, postulaciones con CV pueden fallar (el resto del sitio funciona).

---

## 1. Neon (PostgreSQL)

1. Creá cuenta en [https://neon.tech](https://neon.tech)
2. New Project → nombre `aurapro`
3. Copiá la connection string (**DATABASE_URL**) con SSL, ej.:

```env
DATABASE_URL=postgresql://user:pass@ep-xxxx.aws.neon.tech/neondb?sslmode=require
```

---

## 2. Railway (API Nest)

1. [https://railway.app](https://railway.app) → New Project → **Deploy from GitHub repo**
2. Seleccioná `CrisNeyra/pagina-web-ventapc`
3. En el servicio: **Settings → Root Directory** = `api`
4. Variables (Variables tab):

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | (la de Neon) |
| `JWT_SECRET` | string largo aleatorio |
| `CORS_ORIGINS` | `https://pagina-web-ventapc.vercel.app,http://localhost:3000` |
| `ADMIN_EMAILS` | tu email de prueba admin |
| `DISABLE_FIREBASE_EXCHANGE` | `true` |
| `PORT` | Railway suele inyectarlo; si no, `4000` |
| `NODE_ENV` | `production` |

5. Deploy. El `railway.toml` en `api/` corre build + `npm run start:cloud` (migrate + seed + start).
6. **Settings → Networking → Generate Domain** → copiá la URL pública, ej. `https://aurapro-api.up.railway.app`
7. Probá: `https://TU-DOMINIO.up.railway.app/api/health` → debe mostrar `"ok": true` y `"postgres": true`.

Usuario admin del seed (por defecto):
- Email: `admin@aurapro.com` (o `ADMIN_EMAIL`)
- Password: `1234ab` (o `ADMIN_PASSWORD`) — compatible con el validador del AuthModal
- Agregá el mismo email en `ADMIN_EMAILS` en Railway

---

## 3. Vercel (frontend)

1. Proyecto → **Settings → Environment Variables** (Production + Preview):

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://TU-DOMINIO.up.railway.app/api` |
| `NEXT_PUBLIC_USE_API_CATALOG` | `true` |
| `NEXT_PUBLIC_AUTH_MODE` | `nest` |
| `NEXT_PUBLIC_SITE_URL` | `https://pagina-web-ventapc.vercel.app` |

2. **Deployments → ⋯ → Redeploy** (sin cache si hace falta).
3. Abrí la web: catálogo/login/pedidos deben pegarle a Railway.

---

## 4. Checklist reclutador

- [ ] Live: https://pagina-web-ventapc.vercel.app
- [ ] Health API: `…/api/health` → ok
- [ ] Registro / login Nest funciona
- [ ] GitHub: https://github.com/CrisNeyra/pagina-web-ventapc
- [ ] README menciona Vercel + Nest (Railway) + Neon

---

## Notas

- **Cold start:** en free tier Railway puede dormir; la 1ª request tarda 10–30s.
- **Local:** seguí con Docker (`postgres`/`redis`/`minio`) + `cd api && npm run start:dev`.
- **Alternativa a Neon:** Postgres plugin de Railway (misma `DATABASE_URL`).
- **Redis opcional:** Upstash `REDIS_URL` si querés rate-limit en cloud.

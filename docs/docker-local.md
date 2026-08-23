# Docker local — Aura Pro

Guía paso a paso para levantar PostgreSQL, Redis, MinIO y la API NestJS en Windows.

## Requisitos

- [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/) con WSL 2
- Node.js 20+
- Git

## 1. Instalar Docker Desktop

1. Descargá e instalá Docker Desktop.
2. Habilitá **Use WSL 2 based engine** durante la instalación.
3. Reiniciá la PC si el instalador lo solicita.
4. Abrí Docker Desktop y esperá **"Docker Desktop is running"**.

Verificá en PowerShell:

```powershell
docker --version
docker compose version
```

## 2. Levantar infraestructura

Desde la raíz del proyecto:

```powershell
cd "D:\Devs\Pagina web ventaPC"
docker compose up -d postgres redis minio
docker compose ps
```

| Servicio   | Puerto | Uso                    |
|------------|--------|------------------------|
| PostgreSQL | 5432   | Base de datos          |
| Redis      | 6379   | Rate limit / cache     |
| MinIO      | 9000   | API S3 (CVs)           |
| MinIO UI   | 9001   | Consola web MinIO      |

Credenciales por defecto (solo desarrollo): ver [`docker-compose.yml`](../docker-compose.yml).

## 3. Preparar catálogo y API

```powershell
# Exportar productos estáticos → seed JSON
npm run catalogo:export:api

cd api
copy .env.example .env
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

La API queda en `http://localhost:4000/api`.

## 4. Verificar salud

En otra terminal:

```powershell
curl http://localhost:4000/api/health
curl http://localhost:4000/api/products
```

`/health` debe devolver `"ok": true` con `postgres` y `redis` en `true`.

## 5. Conectar el frontend

En `.env.local` (raíz):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_USE_API_CATALOG=true
```

```powershell
cd "D:\Devs\Pagina web ventaPC"
npm run dev
```

Abrí `http://localhost:3000/productos`.

## 6. API en Docker (opcional)

```powershell
docker compose up -d --build api
```

## 7. Comandos útiles

```powershell
# Ver logs
docker compose logs -f api

# Detener todo
docker compose down

# Backup Postgres
docker compose exec postgres pg_dump -U aurapro aurapro > backup.sql

# Prisma Studio (UI de la DB)
cd api
npx prisma studio
```

## Solución de problemas

| Problema | Solución |
|----------|----------|
| `docker` no reconocido | Instalá Docker Desktop y reiniciá la terminal |
| Puerto 5432 ocupado | Detené otro Postgres local o cambiá el puerto en `docker-compose.yml` |
| `prisma migrate` falla | Verificá que `postgres` esté `healthy`: `docker compose ps` |
| API no conecta a Redis | Esperá 10 s tras `docker compose up`; Redis tarda en estar listo |

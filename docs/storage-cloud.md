# Storage de CVs (postulaciones)

Los CVs PDF se guardan vía `StorageService` en Nest.

## Modos

| Modo | Cuándo | Dónde |
|------|--------|--------|
| **Local** | Sin `MINIO_ENDPOINT` | Carpeta `api/uploads/` (o `UPLOADS_DIR`) |
| **MinIO / S3** | Con `MINIO_*` | Bucket configurado |

Sin MinIO la API **sigue funcionando**: sube a disco local y el admin descarga el PDF autenticado (`GET /admin/postulaciones/:id/cv` con JWT).

## Cloud (recomendado en Railway)

Opciones:

1. **MinIO** en un servicio aparte (o self-hosted) + vars `MINIO_*`
2. **S3-compatible** (R2, Spaces, etc.): mismo SDK; apuntá `MINIO_ENDPOINT` / keys al proveedor
3. **Solo demo**: omitir MinIO; CVs en disco efímero del contenedor (se pierden al redeploy)

Variables (ver `api/.env.example`):

```env
# Opcional — sin esto = storage local
MINIO_ENDPOINT=
MINIO_PORT=9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=aurapro
MINIO_USE_SSL=false
UPLOADS_DIR=uploads
```

Health: `GET /api/health` → `services.storage` y `services.storageMode` (`local` | `minio`).

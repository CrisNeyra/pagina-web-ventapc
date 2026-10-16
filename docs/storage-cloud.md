# Storage de CVs (postulaciones)

Los PDF se guardan desde Next (`src/lib/cv-storage.ts`).

| Modo | Cuándo | Dónde |
|------|--------|--------|
| Blob | Con `BLOB_READ_WRITE_TOKEN` | Vercel Blob (privado) |
| Disco | Sin token (solo dev) | Carpeta `uploads/` o `UPLOADS_DIR` |

El admin descarga el PDF autenticado en `GET /api/admin/postulaciones/:id/cv`.

En Vercel hace falta el token de Blob: sin él el filesystem del deploy no persiste los archivos.

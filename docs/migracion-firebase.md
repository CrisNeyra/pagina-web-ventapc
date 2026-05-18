# Migracion de Supabase a Firebase

Esta guia completa la migracion iniciada en el frontend.

## 1) Autenticacion: migracion de usuarios

### Exportar desde Supabase
1. Exporta usuarios desde `auth.users` en Supabase (CSV o JSON).
2. Conserva estos campos: `id`, `email`, `encrypted_password`, `email_confirmed_at`, `created_at`.

### Importar en Firebase Auth
La importacion de hashes requiere Admin SDK y parametros de hash compatibles.

Ejemplo base:

```bash
npm i firebase-admin
```

```ts
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp({
  credential: cert("./service-account.json"),
});

await getAuth().importUsers([
  {
    uid: "uid_original",
    email: "usuario@dominio.com",
    // passwordHash y passwordSalt deben mapear al algoritmo original
    passwordHash: Buffer.from("HASH_BASE64", "base64"),
    passwordSalt: Buffer.from("SALT_BASE64", "base64"),
    emailVerified: true,
  },
]);
```

Si no puedes mapear el hash de Supabase en forma segura, aplica flujo de "reset password masivo" al primer ingreso.

## 2) Base de datos: modelo recomendado para e-commerce

Colecciones sugeridas en Firestore:
- `productos/{productoId}`
- `categorias/{categoriaId}`
- `usuarios/{uid}`
- `usuarios/{uid}/carrito/{itemId}`
- `pedidos/{pedidoId}`
- `pc_builds/{buildId}` (ya implementado en el frontend)

Buenas practicas:
- Desnormaliza solo para lecturas frecuentes (ej: snapshot de precio y nombre en `pedidos.items`).
- Usa `createdAt` y `updatedAt` con `serverTimestamp()`.
- Evita consultas sin indice en filtros combinados; crea indices compuestos.

## 3) Storage: reemplazo de Supabase Storage

1. Descarga los assets de Supabase Storage.
2. Sube a Cloud Storage (`gs://<tu-bucket>`), manteniendo rutas estables.
3. Guarda en Firestore solo `storagePath` y genera URL firmada o `getDownloadURL` en frontend.

## 4) Backend: Cloud Functions

Casos tipicos:
- crear pedido transaccional
- integrar Stripe/Mercado Pago
- enviar emails/notificaciones
- webhooks seguros

Recomendacion minima:
- Functions v2 + Node 20
- secretos en `firebase functions:secrets:set`
- validar autenticacion (`context.auth`) y payload

## 5) Hosting

```bash
npm i -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

---

## Respuestas rapidas a preguntas frecuentes

### Estructura Firestore para productos/categorias/pedidos
- `productos` con datos de catalogo y stock visible.
- `categorias` para taxonomia y banners.
- `pedidos` con snapshot inmutable de items/precios al momento de compra.
- subcolecciones por usuario para carrito y preferencias.

### Pagos (Stripe/Mercado Pago) con seguridad
- Crear intenciones de pago solo en Cloud Functions (nunca en cliente).
- Firmar y verificar webhooks en Functions.
- Confirmar estado de pago desde webhook antes de marcar pedido como pago.
- Guardar claves en Secrets Manager, no en `NEXT_PUBLIC_*`.

### Monitoreo y analitica en Firebase
- Firebase Performance Monitoring para tiempos de carga.
- Google Analytics 4 para eventos de conversion y embudo.
- Crashlytics (si tienes app movil) y Cloud Logging para Functions.
- Alertas en GCP Monitoring para errores y latencia.

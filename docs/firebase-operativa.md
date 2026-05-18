# Firebase - Operativa de migracion y backend

## 1) Preparar credenciales

1. Crea una service account en Firebase Console:
   - Proyecto: `aurapro-27727`
   - IAM & Admin -> Service Accounts -> Generate new private key
2. Guarda el JSON en:
   - `secrets/firebase-service-account.json`

## 2) Importar usuarios (Supabase -> Firebase Auth)

Formato esperado de entrada (`exports/auth-users.json`):

```json
[
  {
    "id": "uuid",
    "email": "usuario@dominio.com",
    "encrypted_password": "$2a$10$..."
  }
]
```

Prueba sin escritura:

```bash
npm run firebase:users:import -- --input ./exports/auth-users.json --service-account ./secrets/firebase-service-account.json --dry-run true
```

Ejecucion real:

```bash
npm run firebase:users:import -- --input ./exports/auth-users.json --service-account ./secrets/firebase-service-account.json
```

## 3) Migrar datos a Firestore

Para `pc_builds`:

```bash
npm run firebase:firestore:migrate -- --input ./exports/pc_builds.json --collection pc_builds --service-account ./secrets/firebase-service-account.json
```

## 4) Functions de pago y webhook

Funciones incluidas:
- `createStripePaymentIntent`
- `stripeWebhook`
- `healthcheck`

Instalar dependencias de `functions/`:

```bash
npm install --prefix functions
```

Configurar secrets:

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

Emulador local:

```bash
npm run firebase:functions:serve
```

Deploy:

```bash
npm run firebase:functions:deploy
```

## 5) Desplegar reglas Firestore/Storage

```bash
firebase deploy --only firestore:rules,storage
```

## 6) Prueba de auth en frontend

1. Verifica `.env.local` con `NEXT_PUBLIC_FIREBASE_*`.
2. Habilita Email/Password en Firebase Console:
   - Authentication -> Sign-in method -> Email/Password.
3. Ejecuta:

```bash
npm run dev
```

4. En la web:
   - abrir modal de usuario
   - registrarse con email+password
   - cerrar sesion y volver a iniciar sesion

Si esto funciona, la migracion de auth en frontend quedo operativa.

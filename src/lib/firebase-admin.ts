import admin from "firebase-admin";
import type { App } from "firebase-admin/app";

export function firebaseAdminConfigurado(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim());
}

export function obtenerFirebaseAdmin(): App | null {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!json) return null;

  try {
    const serviceAccount = JSON.parse(json) as admin.ServiceAccount;
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch {
    return null;
  }
}

export function obtenerFirebaseAuthAdmin() {
  const app = obtenerFirebaseAdmin();
  if (!app) return null;
  return admin.auth(app);
}

export function obtenerFirestoreAdmin() {
  const app = obtenerFirebaseAdmin();
  if (!app) return null;
  return admin.firestore(app);
}

export function obtenerStorageAdmin() {
  const app = obtenerFirebaseAdmin();
  if (!app) return null;
  return admin.storage(app);
}

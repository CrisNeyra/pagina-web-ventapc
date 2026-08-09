import { initializeApp, getApp, getApps } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { obtenerEntornoFirebase } from "@/configuracion/entornoFirebase";
import { inicializarAppCheck } from "@/configuracion/appCheck";

let appFirebase: FirebaseApp | null = null;

export function obtenerAppFirebase(): FirebaseApp | null {
  const entorno = obtenerEntornoFirebase();
  if (!entorno) return null;

  if (!appFirebase) {
    appFirebase =
      getApps().length > 0
        ? getApp()
        : initializeApp({
            apiKey: entorno.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: entorno.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: entorno.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: entorno.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: entorno.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: entorno.NEXT_PUBLIC_FIREBASE_APP_ID,
            measurementId: entorno.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
          });

    if (typeof window !== "undefined") {
      inicializarAppCheck(appFirebase);
    }
  }

  return appFirebase;
}

export function obtenerAuthFirebase() {
  const app = obtenerAppFirebase();
  if (!app) return null;
  return getAuth(app);
}

export function obtenerFirestoreDb() {
  const app = obtenerAppFirebase();
  if (!app) return null;
  return getFirestore(app);
}

export function obtenerStorageFirebase() {
  const app = obtenerAppFirebase();
  if (!app) return null;
  return getStorage(app);
}

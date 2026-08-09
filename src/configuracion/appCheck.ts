import type { FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: string;
  }
}

export function inicializarAppCheck(app: FirebaseApp): void {
  if (typeof window === "undefined") return;

  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY?.trim();
  if (!siteKey) return;

  const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN?.trim();
  if (debugToken && process.env.NODE_ENV !== "production") {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

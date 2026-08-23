"use client";

import { useEffect, useState } from "react";

export default function DevConfigBanner() {
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    void fetch("/api/health")
      .then((r) => r.json())
      .then((datos: { firebaseAdmin?: boolean; api?: boolean; apiOk?: boolean }) => {
        const avisos: string[] = [];
        if (!datos.firebaseAdmin) {
          avisos.push("FIREBASE_SERVICE_ACCOUNT_JSON no configurado (sesión/admin limitados).");
        }
        if (datos.api && !datos.apiOk) {
          avisos.push("NEXT_PUBLIC_API_URL configurada pero la API no responde.");
        }
        if (avisos.length > 0) setMensaje(avisos.join(" "));
      })
      .catch(() => {});
  }, []);

  if (!mensaje) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200"
    >
      <strong>Modo desarrollo:</strong> {mensaje}
    </div>
  );
}

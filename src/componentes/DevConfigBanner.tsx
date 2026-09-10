"use client";

import { useEffect, useState } from "react";

export default function DevConfigBanner() {
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    void fetch("/api/health")
      .then((r) => r.json())
      .then((datos: { api?: boolean; apiOk?: boolean }) => {
        const avisos: string[] = [];
        if (!datos.api) {
          avisos.push("Falta NEXT_PUBLIC_API_URL (API Nest).");
        } else if (!datos.apiOk) {
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
      className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-800"
    >
      <strong>Modo desarrollo:</strong> {mensaje}
    </div>
  );
}

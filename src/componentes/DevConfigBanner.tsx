"use client";

import { useEffect, useState } from "react";

export default function DevConfigBanner() {
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    void fetch("/api/health")
      .then((r) => r.json())
      .then(
        (datos: {
          database?: boolean;
          databaseOk?: boolean;
          api?: boolean;
          apiOk?: boolean;
          mode?: string;
        }) => {
          const avisos: string[] = [];
          if (!datos.database) {
            avisos.push(
              "Falta DATABASE_URL (Neon). Pegá la connection string en .env.local."
            );
          } else if (!datos.databaseOk) {
            avisos.push(
              "DATABASE_URL configurada pero no hay conexión a Postgres/Neon."
            );
          }
          if (datos.mode === "external-nest" && datos.api && !datos.apiOk) {
            avisos.push("NEXT_PUBLIC_API_URL apunta a Nest pero no responde.");
          }
          if (avisos.length > 0) setMensaje(avisos.join(" "));
        }
      )
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

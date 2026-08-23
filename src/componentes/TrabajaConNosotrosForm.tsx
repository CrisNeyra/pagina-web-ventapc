"use client";

import { FormEvent, useState } from "react";
import { FiUpload, FiSend } from "react-icons/fi";
import { toast } from "sonner";
import { apiConfigurada } from "@/lib/api-client";
import { enviarPostulacionApi } from "@/servicios/apiBackendServicio";

const MAX_CV_MB = 5;

function mapearError(error: string): string {
  switch (error) {
    case "CAMPOS_REQUERIDOS":
      return "Completá nombre, email y teléfono.";
    case "CV_INVALIDO":
      return "El CV debe ser un archivo PDF.";
    case "CV_DEMASIADO_GRANDE":
      return `El CV no puede superar los ${MAX_CV_MB} MB.`;
    case "POSTULACIONES_NO_CONFIGURADAS":
      return "Las postulaciones no están configuradas en el servidor. Contactanos por email.";
    default:
      return "No se pudo enviar la postulación. Intentá nuevamente.";
  }
}

export default function TrabajaConNosotrosForm() {
  const [enviando, setEnviando] = useState(false);
  const [archivoNombre, setArchivoNombre] = useState("");

  const manejarSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setEnviando(true);

    const formulario = evento.currentTarget;
    const formData = new FormData(formulario);

    try {
      if (apiConfigurada()) {
        await enviarPostulacionApi(formData);
      } else {
        const respuesta = await fetch("/api/postulaciones", {
          method: "POST",
          body: formData,
        });

        const datos = (await respuesta.json().catch(() => ({}))) as { error?: string };

        if (!respuesta.ok) {
          toast.error(mapearError(datos.error ?? "ERROR_INTERNO"));
          return;
        }
      }

      toast.success("¡Postulación enviada! Te contactaremos pronto.");
      formulario.reset();
      setArchivoNombre("");
    } catch {
      toast.error("Error de red al enviar la postulación.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={manejarSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-cyber-cyan-200">Nombre completo *</span>
          <input
            name="nombre"
            required
            className="w-full rounded-lg border border-cyber-purple-500/35 bg-oscuro-800/80 px-3 py-2.5 text-sm text-white outline-none focus:border-cyber-cyan-400"
            placeholder="Tu nombre"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-cyber-cyan-200">Email *</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-cyber-purple-500/35 bg-oscuro-800/80 px-3 py-2.5 text-sm text-white outline-none focus:border-cyber-cyan-400"
            placeholder="tu@email.com"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-cyber-cyan-200">Teléfono *</span>
        <input
          name="telefono"
          required
          className="w-full rounded-lg border border-cyber-purple-500/35 bg-oscuro-800/80 px-3 py-2.5 text-sm text-white outline-none focus:border-cyber-cyan-400"
          placeholder="+54 9 11 0000-0000"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-cyber-cyan-200">Mensaje</span>
        <textarea
          name="mensaje"
          rows={4}
          className="w-full resize-y rounded-lg border border-cyber-purple-500/35 bg-oscuro-800/80 px-3 py-2.5 text-sm text-white outline-none focus:border-cyber-cyan-400"
          placeholder="Contanos sobre tu experiencia y el puesto que te interesa."
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-cyber-cyan-200">CV (PDF) *</span>
        <div className="relative">
          <input
            name="cv"
            type="file"
            accept="application/pdf,.pdf"
            required
            onChange={(evento) => {
              const archivo = evento.target.files?.[0];
              setArchivoNombre(archivo?.name ?? "");
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-cyber-purple-500/45 bg-oscuro-800/60 px-4 py-4">
            <FiUpload className="shrink-0 text-cyber-cyan-400" size={20} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                {archivoNombre || "Seleccioná tu CV en PDF"}
              </p>
              <p className="text-xs text-cyber-cyan-200/70">Máximo {MAX_CV_MB} MB</p>
            </div>
          </div>
        </div>
      </label>

      <button
        type="submit"
        disabled={enviando}
        className="inline-flex items-center gap-2 rounded-md bg-cyber-cyan-500 px-5 py-3 text-sm font-bold text-oscuro-950 transition-colors hover:bg-cyber-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FiSend size={16} />
        {enviando ? "Enviando..." : "Enviar postulación"}
      </button>
    </form>
  );
}

"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { FiX } from "react-icons/fi";
import AIAssistantButton from "@/componentes/AIAssistantButton";

interface Mensaje {
  rol: "user" | "asesor";
  texto: string;
}

export default function AsesorChat() {
  const panelId = useId();
  const [abierto, setAbierto] = useState(false);
  const [habilitado, setHabilitado] = useState<boolean | null>(null);
  const [texto, setTexto] = useState("");
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    void fetch("/api/asistente")
      .then((respuesta) => respuesta.json())
      .then((datos: { enabled?: boolean }) => {
        if (!cancelado) setHabilitado(Boolean(datos.enabled));
      })
      .catch(() => {
        if (!cancelado) setHabilitado(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!abierto) return;

    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };

    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [abierto]);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const consulta = texto.trim();
    if (!consulta || enviando || habilitado === false) return;

    setTexto("");
    setMensajes((previos) => [...previos, { rol: "user", texto: consulta }]);
    setEnviando(true);
    try {
      const respuesta = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: consulta }),
      });
      const datos = (await respuesta.json().catch(() => ({}))) as {
        respuesta?: string;
        message?: string;
      };
      const textoAsesor =
        datos.respuesta || datos.message || "No pude responder esa consulta.";
      setMensajes((previos) => [...previos, { rol: "asesor", texto: textoAsesor }]);
    } catch {
      setMensajes((previos) => [
        ...previos,
        { rol: "asesor", texto: "No hay conexión con el asesor." },
      ]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[101] flex flex-col items-end">
      <section
        id={panelId}
        aria-label="Asesor de Aura Pro"
        aria-hidden={!abierto}
        className={`mb-3 flex max-h-[min(28rem,calc(100dvh-11rem))] w-[min(22rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-cyber-purple-500/35 bg-oscuro-950 shadow-xl transition-all duration-200 ${
          abierto
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible translate-y-2 scale-[0.98] opacity-0"
        }`}
        {...(!abierto ? { inert: true } : {})}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-cyber-purple-500/25 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-foreground">Asesor Aura Pro</p>
            <p className="text-xs text-muted">Stock, compatibilidad y fichas</p>
          </div>
          <button
            type="button"
            onClick={() => setAbierto(false)}
            className="rounded-md p-1 text-foreground hover:bg-oscuro-800"
            aria-label="Cerrar asesor"
          >
            <FiX size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm">
          {habilitado === false && (
            <p className="rounded-lg bg-oscuro-800 px-3 py-2 text-foreground">
              El asesor no está configurado.
            </p>
          )}
          {habilitado !== false && mensajes.length === 0 && (
            <p className="rounded-lg bg-oscuro-800 px-3 py-2 text-foreground">
              Preguntame por stock, si dos componentes son compatibles o por el detalle de un
              producto del catálogo.
            </p>
          )}
          {mensajes.map((mensaje, indice) => (
            <p
              key={`${mensaje.rol}-${indice}`}
              className={`rounded-lg px-3 py-2 ${
                mensaje.rol === "user"
                  ? "ml-6 bg-ink-cyan text-white"
                  : "mr-6 bg-oscuro-800 text-foreground"
              }`}
            >
              {mensaje.texto}
            </p>
          ))}
          {enviando && <p className="text-xs text-muted">Consultando el catálogo...</p>}
        </div>
        <form
          onSubmit={(evento) => void enviar(evento)}
          className="shrink-0 border-t border-cyber-purple-500/25 p-3"
        >
          <label className="sr-only" htmlFor="consulta-asesor">
            Consulta al asesor
          </label>
          <div className="flex gap-2">
            <input
              id="consulta-asesor"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              maxLength={1000}
              disabled={habilitado === false || enviando}
              placeholder="¿Esta mother va con un Ryzen?"
              className="min-w-0 flex-1 rounded-md border border-cyber-purple-500/35 bg-oscuro-900 px-3 py-2 text-sm text-foreground"
            />
            <button
              type="submit"
              disabled={habilitado === false || enviando || texto.trim().length === 0}
              className="rounded-md bg-ink-cyan px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </form>
      </section>

      <AIAssistantButton
        abierto={abierto}
        onToggle={() => setAbierto((valor) => !valor)}
        panelId={panelId}
      />
    </div>
  );
}

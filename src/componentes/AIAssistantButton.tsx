"use client";

import { useEffect, useRef, useState } from "react";

interface AIAssistantButtonProps {
  abierto: boolean;
  onToggle: () => void;
  panelId: string;
}

export default function AIAssistantButton({
  abierto,
  onToggle,
  panelId,
}: AIAssistantButtonProps) {
  const [fijo, setFijo] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const salidaRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (salidaRef.current) window.clearTimeout(salidaRef.current);
    };
  }, []);

  const mostrarGlobo = () => {
    if (salidaRef.current) window.clearTimeout(salidaRef.current);
    setSaliendo(false);
    setFijo(true);
  };

  const ocultarGlobo = () => {
    setFijo(false);
    setSaliendo(true);
    salidaRef.current = window.setTimeout(() => setSaliendo(false), 450);
  };

  const claseGlobo = [
    "asesor-globo pointer-events-none absolute bottom-full right-0 mb-3 hidden max-w-[220px] rounded-xl border border-cyber-purple-500/35 bg-oscuro-950/95 px-3 py-2 text-right text-xs font-medium leading-snug text-cyber-cyan-100 opacity-0 shadow-lg backdrop-blur-sm motion-reduce:hidden sm:block",
    fijo ? "asesor-globo-fijo" : "",
    saliendo ? "asesor-globo-sale" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="asesor-fab-enter relative flex flex-col items-end"
      onMouseEnter={mostrarGlobo}
      onMouseLeave={ocultarGlobo}
      onFocus={mostrarGlobo}
      onBlur={(evento) => {
        if (!(evento.relatedTarget instanceof Node) || !evento.currentTarget.contains(evento.relatedTarget)) {
          ocultarGlobo();
        }
      }}
    >
      {!abierto && (
        <p role="tooltip" className={claseGlobo}>
          ¿Buscás asesoramiento para tu PC?
        </p>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        aria-controls={panelId}
        aria-label={abierto ? "Cerrar asesor de compras" : "Abrir asesor de compras con IA"}
        className="fab-pulso relative inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-ink-violet via-[#5b21b6] to-ink-cyan text-white shadow-[0_0_24px_rgba(74,0,224,0.45)] transition-shadow duration-200 hover:scale-105 hover:shadow-[0_0_32px_rgba(0,122,140,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-oscuro-950 active:scale-95"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-to-br from-ink-violet to-ink-cyan opacity-40 blur-md"
        />
        <svg viewBox="0 0 64 64" aria-hidden className="robot-cuerpo relative z-[1] h-9 w-9">
          <line
            x1="32"
            y1="14"
            x2="32"
            y2="7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle className="robot-luz" cx="32" cy="5.5" r="3.2" fill="#67e8f9" />
          <rect x="14" y="14" width="36" height="30" rx="14" fill="currentColor" />
          <rect x="8" y="22" width="6" height="10" rx="3" fill="currentColor" opacity="0.85" />
          <rect x="50" y="22" width="6" height="10" rx="3" fill="currentColor" opacity="0.85" />
          <g className="robot-ojos">
            <ellipse cx="24" cy="28" rx="3.2" ry="3.6" fill="#1e1038" />
            <ellipse cx="40" cy="28" rx="3.2" ry="3.6" fill="#1e1038" />
            <circle cx="25.1" cy="26.8" r="1" fill="white" />
            <circle cx="41.1" cy="26.8" r="1" fill="white" />
          </g>
          <path
            d="M25 35.5c1.8 2 4 3 7 3s5.2-1 7-3"
            stroke="#1e1038"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="27" y="46" width="10" height="4" rx="2" fill="currentColor" opacity="0.9" />
          <path
            d="M22 50.5h6M36 50.5h6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 z-[2] flex h-3.5 w-3.5 items-center justify-center motion-reduce:hidden"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyber-cyan-400 opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyber-cyan-300 ring-2 ring-oscuro-950" />
        </span>
      </button>

      <p className="mt-1.5 max-w-[9rem] text-center text-[10px] font-semibold leading-tight text-cyber-cyan-200/90 sm:hidden">
        ¿Buscás asesoramiento para tu PC?
      </p>
    </div>
  );
}

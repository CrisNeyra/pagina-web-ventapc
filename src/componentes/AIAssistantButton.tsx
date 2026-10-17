"use client";

import { FiCpu } from "react-icons/fi";

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
  return (
    <div className="asesor-fab-enter group relative flex flex-col items-end">
      <p
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 mb-3 hidden max-w-[220px] rounded-xl border border-cyber-purple-500/35 bg-oscuro-950/95 px-3 py-2 text-right text-xs font-medium leading-snug text-cyber-cyan-100 shadow-lg backdrop-blur-sm transition-all duration-200 sm:block sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100"
      >
        ¿Buscás asesoramiento para tu PC?
      </p>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        aria-controls={panelId}
        aria-label={abierto ? "Cerrar asesor de compras" : "Abrir asesor de compras con IA"}
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-ink-violet via-[#5b21b6] to-ink-cyan text-white shadow-[0_0_24px_rgba(74,0,224,0.45)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_32px_rgba(0,122,140,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-oscuro-950 active:scale-95"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-to-br from-ink-violet to-ink-cyan opacity-40 blur-md"
        />
        <FiCpu className="relative z-[1] h-7 w-7" strokeWidth={2.2} />
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

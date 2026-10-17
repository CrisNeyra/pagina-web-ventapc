"use client";

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
      {!abierto && (
        <p
          role="tooltip"
          className="asesor-globo pointer-events-none absolute bottom-full right-0 mb-3 hidden max-w-[220px] rounded-xl border border-cyber-purple-500/35 bg-oscuro-950/95 px-3 py-2 text-right text-xs font-medium leading-snug text-cyber-cyan-100 opacity-0 shadow-lg backdrop-blur-sm motion-reduce:hidden sm:block"
        >
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
        <svg
          viewBox="0 0 32 32"
          aria-hidden
          className="relative z-[1] h-8 w-8"
          fill="none"
        >
          <path d="M16 3.2v2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="16" cy="2.4" r="1.3" fill="currentColor" />
          <rect x="7" y="8" width="18" height="14" rx="6" fill="currentColor" />
          <circle cx="12.2" cy="14.2" r="1.5" fill="#1e1038" />
          <circle cx="19.8" cy="14.2" r="1.5" fill="#1e1038" />
          <path
            d="M12.4 17.6c.9 1.1 2.1 1.6 3.6 1.6s2.7-.5 3.6-1.6"
            stroke="#1e1038"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path d="M7 14H5.2M26.8 14H25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 22.2v2.2M20 22.2v2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10.5 24.6h3.2M18.3 24.6h3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const WHATSAPP_URL =
  "https://wa.me/5491168883430?text=Hola,%20me%20comunico%20desde%20Aura%20Pro%20para%20recibir%20asesoramiento.";

export default function FloatingWhatsApp() {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const botonRef = useRef<HTMLButtonElement | null>(null);
  const cierreTimerRef = useRef<number | null>(null);

  const cancelarCierre = () => {
    if (cierreTimerRef.current !== null) {
      window.clearTimeout(cierreTimerRef.current);
      cierreTimerRef.current = null;
    }
  };

  const abrirPanel = () => {
    cancelarCierre();
    setAbierto(true);
  };

  const programarCierre = () => {
    cancelarCierre();
    cierreTimerRef.current = window.setTimeout(() => {
      setAbierto(false);
      cierreTimerRef.current = null;
    }, 120);
  };

  useEffect(() => {
    return () => cancelarCierre();
  }, []);

  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (!contenedorRef.current) return;
      if (!contenedorRef.current.contains(event.target as Node)) {
        cancelarCierre();
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  useEffect(() => {
    if (!abierto) return;

    const manejarEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelarCierre();
        setAbierto(false);
        botonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", manejarEscape);
    return () => document.removeEventListener("keydown", manejarEscape);
  }, [abierto]);

  const abrirWhatsApp = () => {
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
    cancelarCierre();
    setAbierto(false);
  };

  return (
    <div ref={contenedorRef} className="fixed bottom-6 right-6 z-[100]">
      <div className="relative">
        <div
          role="dialog"
          aria-label="Confirmar apertura de WhatsApp"
          onMouseEnter={abrirPanel}
          onMouseLeave={programarCierre}
          className={`absolute bottom-0 right-full mr-3 w-[min(292px,calc(100vw-6.5rem))] overflow-hidden rounded-2xl border border-[#128C7E]/55 bg-[#1F2C34] shadow-[0_0_25px_rgba(18,140,126,0.35)] transition-all duration-200 ${
            abierto
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none invisible translate-y-2 opacity-0"
          }`}
          aria-hidden={!abierto}
          {...(!abierto ? { inert: true } : {})}
        >
          <div className="px-4 pb-4 pt-3">
            <p className="text-sm font-semibold text-[#E7F3F0]">¿Querés abrir WhatsApp?</p>
            <p className="mt-1 text-xs text-[#BFD8D2]">Te vamos a redirigir al chat de Aura Pro.</p>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  cancelarCierre();
                  setAbierto(false);
                }}
                className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={abrirWhatsApp}
                className="rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-bold text-[#103022] transition-colors hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7DF5AA]"
              >
                Ir a WhatsApp
              </button>
            </div>
          </div>
        </div>

        <button
          ref={botonRef}
          type="button"
          onClick={() => setAbierto((valorPrevio) => !valorPrevio)}
          onMouseEnter={abrirPanel}
          onMouseLeave={programarCierre}
          onFocus={abrirPanel}
          onBlur={programarCierre}
          aria-label="Abrir WhatsApp"
          aria-expanded={abierto}
          className="fab-pulso inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.55)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7DF5AA]"
        >
          <Image
            src="/WhatsApp.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}

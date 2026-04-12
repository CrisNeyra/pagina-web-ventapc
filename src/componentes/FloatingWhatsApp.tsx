"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const WHATSAPP_URL =
  "https://wa.me/5491168883430?text=Hola,%20me%20comunico%20desde%20Aura%20Pro%20para%20recibir%20asesoramiento.";

export default function FloatingWhatsApp() {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (!contenedorRef.current) return;
      if (!contenedorRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  return (
    <div ref={contenedorRef} className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      <div
        className={`w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#128C7E]/50 shadow-[0_0_25px_rgba(18,140,126,0.35)] transition-all duration-300 ${
          abierto
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between bg-[#075E54] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative h-7 w-7 overflow-hidden rounded-full bg-[#25D366] p-1">
              <Image src="/WhatsApp.svg" alt="WhatsApp" fill sizes="28px" className="object-contain p-1" />
            </div>
            <p className="text-sm font-bold text-white">WhatsApp</p>
          </div>
          <button
            type="button"
            aria-label="Cerrar diálogo de WhatsApp"
            onClick={() => setAbierto(false)}
            className="rounded-md px-2 py-1 text-white/85 transition-colors hover:bg-white/15 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="bg-[#1F2C34] p-4">
          <div className="mb-3 max-w-[90%] rounded-2xl rounded-bl-md bg-[#263E49] px-3 py-2 text-sm text-[#E7F3F0]">
            Hola, somos el equipo de Aura Pro. ¿En qué podemos ayudarte?
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-bold text-[#103022] transition-colors hover:bg-[#1ebe5d]"
          >
            Abrir chat <span aria-hidden>▶</span>
          </a>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAbierto((valorPrevio) => !valorPrevio)}
        aria-label="Abrir WhatsApp"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.55)] transition-transform duration-200 hover:scale-105"
      >
        <Image src="/WhatsApp.svg" alt="WhatsApp" width={28} height={28} className="h-7 w-7 object-contain" />
      </button>
    </div>
  );
}

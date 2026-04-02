"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Link from "next/link";

// ── Configuración de videos ───────────────────────────────────────────────────
// Colocá tus archivos .mp4 en /public/videos/ y listá sus rutas aquí
const VIDEOS: string[] = [
  "/videos/habitacion-ciberpunk-con-pc-gamer.mp4",
  "/videos/video-con-tematica-de-videojuego.mp4",
  "/videos/habitacion-ciberpunk-con-letrero-luminoso.mp4",
];
const CAMBIO_AUTOMATICO_MS = 5000;

export default function HeroVideos() {
  const [activo, setActivo] = useState(0);
  const touchStartX = useRef(0);

  /** Avanza al siguiente video con wrap-around */
  const siguiente = useCallback(() => {
    setActivo((prev) => (prev + 1) % VIDEOS.length);
  }, []);

  /** Retrocede al video anterior */
  const anterior = useCallback(() => {
    setActivo((prev) => (prev - 1 + VIDEOS.length) % VIDEOS.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(siguiente, CAMBIO_AUTOMATICO_MS);
    return () => window.clearInterval(timer);
  }, [siguiente]);

  // Soporte de swipe táctil horizontal
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 50) siguiente();
    else if (delta < -50) anterior();
  };

  return (
    <section className="w-full bg-oscuro-950 flex flex-col md:flex-row md:items-stretch min-h-0 h-auto md:h-[min(70vh,620px)]">

      {/* ─── Zona de videos — izquierda (60%) ────────────────────────── */}
      <div
        className="relative w-full md:w-[60%] h-[240px] sm:h-[320px] md:h-full min-h-[240px] max-h-[70vh] overflow-hidden bg-oscuro-900 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/*
         * AnimatePresence mode="wait": espera que el video saliente termine
         * su fade-out para iniciar el fade-in del nuevo. El key={activo}
         * le indica a Framer Motion cuándo cambió el elemento.
         */}
        <AnimatePresence mode="sync">
          <motion.div
            key={activo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <video
              autoPlay
              muted
              playsInline
              preload="metadata"
              aria-label={`Video promocional ${activo + 1}`}
              className="h-full w-full scale-[1.15] object-cover object-center"
            >
              <source src={VIDEOS[activo]} type="video/mp4" />
              Tu navegador no soporta la etiqueta de video.
            </video>
          </motion.div>
        </AnimatePresence>

        {/* Líneas de acento azul→dorado en borde superior e inferior */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-cyber-cyan-500 via-cyber-pink-500 to-cyber-lime-400 z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-cyber-cyan-500 via-cyber-pink-500 to-cyber-lime-400 z-10 pointer-events-none" />

        {/* Botón ← anterior */}
        <button
          onClick={anterior}
          aria-label="Video anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10
                     bg-oscuro-950/65 hover:bg-cyber-purple-500/75 text-white p-2.5 rounded-full
                     transition-all duration-200 backdrop-blur-sm border border-cyber-cyan-500/45"
        >
          <FiChevronLeft size={18} />
        </button>

        {/* Botón → siguiente */}
        <button
          onClick={siguiente}
          aria-label="Video siguiente"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                     bg-oscuro-950/65 hover:bg-cyber-purple-500/75 text-white p-2.5 rounded-full
                     transition-all duration-200 backdrop-blur-sm border border-cyber-cyan-500/45"
        >
          <FiChevronRight size={18} />
        </button>

        {/* Indicadores (puntos) — dorado activo, blanco inactivo */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {VIDEOS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActivo(i)}
              aria-label={`Video ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activo
                  ? "bg-cyber-cyan-400 w-6 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                  : "bg-white/40 hover:bg-white/70 w-2"
              }`}
            />
          ))}
        </div>

        {/* Contador 01 / 02 */}
        <span className="hidden absolute top-3 right-4 z-10 text-white/40 text-xs font-mono tracking-widest">
          {String(activo + 1).padStart(2, "0")} / {String(VIDEOS.length).padStart(2, "0")}
        </span>
      </div>

      {/* ─── Panel promocional — derecha (40%) ───────────────────────── */}
      <div className="w-full md:w-[40%] md:h-full min-h-0 bg-oscuro-900 border-l border-cyber-purple-500/35
                      flex items-center justify-center px-6 sm:px-8 md:px-10 py-6 md:py-8 relative overflow-y-auto">

        {/* Glow de fondo sutil */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_rgba(34,211,238,0.12)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,_rgba(236,72,153,0.14)_0%,_transparent_55%)]" />

        <div className="relative max-w-[420px] w-full">
          {/* Badge */}
          <p className="flex items-center gap-2 text-cyber-cyan-400 text-xs sm:text-sm font-bold uppercase tracking-[0.3em] mb-3">
            <FiZap className="text-cyber-yellow-400 shrink-0 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]" size={13} />
            ELECTROSALE
          </p>

          {/* Título principal */}
          <h2 className="font-black uppercase leading-[1.04] text-white
                         text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.2rem]">
            <span className="bg-gradient-to-r from-cyber-purple-300 via-cyber-pink-500 to-cyber-purple-400 bg-clip-text text-transparent
                             inline-block mb-0.5">
              POTENCIÁ
            </span>
            {" "}TU
            <br />
            FORMA DE
            <br />
            JUGAR.
          </h2>

          {/* Subtítulo */}
          <p className="text-cyber-cyan-200 font-semibold uppercase text-sm sm:text-base mt-3 tracking-wide">
            SUBÍ DE NIVEL TUS PERIFÉRICOS.
          </p>

          {/* CTA */}
          <Link
            href="/productos"
            className="mt-5 inline-block border border-cyber-cyan-400 text-cyber-cyan-300
                             hover:bg-cyber-cyan-400 hover:text-oscuro-950
                             font-extrabold uppercase text-sm sm:text-base px-8 py-3 rounded-md
                             tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(168,85,247,0.45)]"
          >
            VER PRODUCTOS →
          </Link>
        </div>
      </div>

    </section>
  );
}


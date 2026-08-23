"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import { HERO_SLIDES } from "@/datos/heroSlides";

const CAMBIO_AUTOMATICO_MS = 5000;

export default function HeroVideos() {
  const [activo, setActivo] = useState(0);
  const [visible, setVisible] = useState(false);
  const [videoListo, setVideoListo] = useState(false);
  const [posterRoto, setPosterRoto] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const slide = HERO_SLIDES[activo];

  const siguiente = useCallback(() => {
    setActivo((prev) => (prev + 1) % HERO_SLIDES.length);
    setVideoListo(false);
    setPosterRoto(false);
  }, []);

  const anterior = useCallback(() => {
    setActivo((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setVideoListo(false);
    setPosterRoto(false);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const actualizar = () => setReducedMotion(media.matches);
    actualizar();
    media.addEventListener("change", actualizar);
    return () => media.removeEventListener("change", actualizar);
  }, []);

  useEffect(() => {
    const elemento = contenedorRef.current;
    if (!elemento) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );

    observer.observe(elemento);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const timer = window.setInterval(siguiente, CAMBIO_AUTOMATICO_MS);
    return () => window.clearInterval(timer);
  }, [visible, siguiente, reducedMotion]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 50) siguiente();
    else if (delta < -50) anterior();
  };

  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-oscuro-950 md:flex-row md:items-stretch">
      <div
        ref={contenedorRef}
        className="relative h-[270px] min-h-[270px] w-full overflow-hidden bg-oscuro-900 select-none sm:h-[324px] md:h-full md:min-h-0 md:w-[60%]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Fondo neutro: evita el flash de “imagen no disponible” si falla el poster. */}
        <div className="absolute inset-0 bg-oscuro-900" aria-hidden />

        {!posterRoto && (
          <Image
            key={slide.poster}
            src={slide.poster}
            alt={slide.titulo}
            fill
            priority={activo === 0}
            sizes="(max-width: 768px) 100vw, 60vw"
            className={`object-cover object-center transition-opacity duration-500 ${
              visible && videoListo ? "opacity-0" : "opacity-100"
            }`}
            onError={() => setPosterRoto(true)}
          />
        )}

        <AnimatePresence mode="sync">
          {visible && !reducedMotion && (
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
                loop
                playsInline
                preload="metadata"
                poster={posterRoto ? undefined : slide.poster}
                aria-label={`Video promocional: ${slide.titulo}`}
                onLoadedData={() => setVideoListo(true)}
                onCanPlay={() => setVideoListo(true)}
                className="h-full w-full scale-[1.15] object-cover object-center"
              >
                {slide.webm && <source src={slide.webm} type="video/webm" />}
                <source src={slide.mp4} type="video/mp4" />
              </video>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-cyber-cyan-500 via-cyber-pink-500 to-cyber-lime-400 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-[3px] bg-gradient-to-r from-cyber-cyan-500 via-cyber-pink-500 to-cyber-lime-400 pointer-events-none" />

        <button
          onClick={anterior}
          aria-label="Video anterior"
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-cyber-cyan-500/45 bg-oscuro-950/65 p-2.5 text-white backdrop-blur-sm transition-all duration-200 hover:bg-cyber-purple-500/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400"
        >
          <FiChevronLeft size={18} />
        </button>

        <button
          onClick={siguiente}
          aria-label="Video siguiente"
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-cyber-cyan-500/45 bg-oscuro-950/65 p-2.5 text-white backdrop-blur-sm transition-all duration-200 hover:bg-cyber-purple-500/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400"
        >
          <FiChevronRight size={18} />
        </button>

        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setActivo(i);
                setVideoListo(false);
                setPosterRoto(false);
              }}
              aria-label={`Video ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activo
                  ? "w-6 bg-cyber-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative flex w-full min-h-[270px] items-center justify-center overflow-y-visible border-l border-cyber-purple-500/35 bg-oscuro-900 px-6 py-8 sm:px-8 md:h-full md:min-h-0 md:w-[40%] md:px-10 md:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(34,211,238,0.12)_0%,_transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(236,72,153,0.14)_0%,_transparent_55%)]" />

        <div className="relative w-full max-w-[420px]">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-cyber-cyan-400 sm:text-sm">
            <FiZap
              className="shrink-0 text-cyber-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]"
              size={13}
            />
            ELECTROSALE
          </p>

          <h2 className="text-3xl font-black uppercase leading-[1.04] text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.2rem]">
            <span className="mb-0.5 inline-block bg-gradient-to-r from-cyber-purple-300 via-cyber-pink-500 to-cyber-purple-400 bg-clip-text text-transparent">
              POTENCIÁ
            </span>{" "}
            TU
            <br />
            FORMA DE
            <br />
            JUGAR.
          </h2>

          <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-cyber-cyan-200 sm:text-base">
            SUBÍ DE NIVEL TUS PERIFÉRICOS.
          </p>

          <Link
            href="/productos"
            className="mt-5 inline-block rounded-md border border-cyber-cyan-400 px-8 py-3 text-sm font-extrabold uppercase tracking-wider text-cyber-cyan-300 shadow-[0_0_20px_rgba(168,85,247,0.45)] transition-all duration-200 hover:bg-cyber-cyan-400 hover:text-oscuro-950 sm:text-base"
          >
            VER PRODUCTOS →
          </Link>
        </div>
      </div>
    </section>
  );
}

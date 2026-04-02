"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Banner } from "@/tipos/producto";

interface CarruselHeroProps {
  banners: Banner[];
  intervaloAutoplay?: number; // milisegundos
}

// Variantes de animación para las transiciones
const variantesSlide = {
  entrar: (direccion: number) => ({
    x: direccion > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  centro: {
    x: 0,
    opacity: 1,
  },
  salir: (direccion: number) => ({
    x: direccion > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export default function CarruselHero({
  banners,
  intervaloAutoplay = 5000,
}: CarruselHeroProps) {
  const [indiceActual, setIndiceActual] = useState(0);
  const [direccion, setDireccion] = useState(1);

  const irAlSiguiente = useCallback(() => {
    setDireccion(1);
    setIndiceActual((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const irAlAnterior = () => {
    setDireccion(-1);
    setIndiceActual((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const irAlIndice = (indice: number) => {
    setDireccion(indice > indiceActual ? 1 : -1);
    setIndiceActual(indice);
  };

  // Autoplay
  useEffect(() => {
    const timer = setInterval(irAlSiguiente, intervaloAutoplay);
    return () => clearInterval(timer);
  }, [irAlSiguiente, intervaloAutoplay]);

  const bannerActual = banners[indiceActual];

  return (
    <section className="relative w-full overflow-hidden bg-oscuro-950">
      {/* Contenedor principal del carrusel */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/7] w-full">
        <AnimatePresence initial={false} custom={direccion} mode="popLayout">
          <motion.div
            key={bannerActual.id}
            custom={direccion}
            variants={variantesSlide}
            initial="entrar"
            animate="centro"
            exit="salir"
            transition={{
              x: { type: "tween", duration: 0.5, ease: "easeInOut" },
              opacity: { duration: 0.3 },
            }}
            className="absolute inset-0"
          >
            {/* Imagen del banner */}
            <div className="relative w-full h-full bg-gradient-to-r from-oscuro-950 to-oscuro-900">
              <Image
                src={bannerActual.imagen}
                alt={bannerActual.titulo}
                fill
                className="object-cover"
                priority={indiceActual === 0}
                sizes="100vw"
                // Si no tenés imágenes aún, el gradiente de fondo se ve igual
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Overlay con degradado */}
              <div className="absolute inset-0 bg-gradient-to-r from-oscuro-950/70 via-oscuro-950/30 to-transparent" />
            </div>

            {/* Contenido del banner */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2 md:mb-4 
                             max-w-lg drop-shadow-lg"
                >
                  {bannerActual.titulo}
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="text-base md:text-xl text-gray-200 mb-4 md:mb-6 max-w-md"
                >
                  {bannerActual.subtitulo}
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <Link
                    href={bannerActual.enlace}
                    className="inline-block bg-transparent border-2 border-white hover:bg-white hover:text-oscuro-950 
                               text-white font-semibold px-6 py-2.5 rounded-md text-sm md:text-base 
                               transition-all duration-200"
                  >
                    Conocé Más
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Flechas de navegación */}
      <button
        onClick={irAlAnterior}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 
                   bg-black/40 hover:bg-black/70 text-white p-2 md:p-3 rounded-full 
                   transition-all duration-200 backdrop-blur-sm z-10"
        aria-label="Banner anterior"
      >
        <FiChevronLeft size={20} />
      </button>
      <button
        onClick={irAlSiguiente}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 
                   bg-black/40 hover:bg-black/70 text-white p-2 md:p-3 rounded-full 
                   transition-all duration-200 backdrop-blur-sm z-10"
        aria-label="Banner siguiente"
      >
        <FiChevronRight size={20} />
      </button>

      {/* Indicadores (puntos) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => irAlIndice(i)}
            aria-label={`Ir al banner ${i + 1}`}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === indiceActual
                ? "bg-gradient-to-r from-azul-500 to-violeta-500 w-6"
                : "bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { categorias } from "@/datos/navegacion";

// Grilla de categorías estilo Compra Gamer: 1 grande a la izq + 4 pequeñas arriba + 4 abajo
export default function GrillaCategorias() {
  // Separamos: la primera es la grande, el resto en grilla
  const categoriaGrande = categorias[0];
  const categoriasChicas = categorias.slice(1);

  return (
    <section className="py-10 md:py-14 bg-oscuro-950">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-muted md:text-2xl">
            Explorá nuestras <span className="font-bold text-foreground">categorías</span>
          </h2>
          <div className="flex gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink-cyan text-ink-cyan transition-all duration-200 hover:bg-ink-cyan hover:text-white"
              aria-label="Anterior"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink-cyan text-ink-cyan transition-all duration-200 hover:bg-ink-cyan hover:text-white"
              aria-label="Siguiente"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Grilla de categorías */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 auto-rows-[160px] md:auto-rows-[180px]">
          {/* Categoría grande (ocupa 2 filas en la primera columna) */}
          <Link
            href={categoriaGrande.href}
            className="group relative col-span-1 md:row-span-2 bg-oscuro-800 rounded-lg overflow-hidden"
          >
            <Image
              src={categoriaGrande.imagen}
              alt={categoriaGrande.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 20vw"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 bg-ink/80 px-3 py-2 text-center text-sm font-bold uppercase tracking-wide text-white">
              {categoriaGrande.nombre}
            </span>
          </Link>

          {/* Categorías chicas */}
          {categoriasChicas.map((cat) => (
            <Link
              key={cat.nombre}
              href={cat.href}
              className="group relative bg-oscuro-800 rounded-lg overflow-hidden"
            >
              <Image
                src={cat.imagen}
                alt={cat.nombre}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 20vw"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 bg-ink/80 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-white">
                {cat.nombre}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

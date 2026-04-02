"use client";

import Image from "next/image";
import Link from "next/link";
import { Novedad } from "@/tipos/producto";
import { formatearPrecio } from "@/utils/formato";

interface UltimasNovedadesProps {
  novedades: Novedad[];
}

// Sección "Conocé nuestras últimas novedades" — grilla de cards con categoría destacada + título + precio
export default function UltimasNovedades({ novedades }: UltimasNovedadesProps) {
  return (
    <section className="py-10 md:py-14 bg-oscuro-950">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl text-gray-400 mb-6">
          Conocé nuestras <span className="font-bold text-white">últimas novedades</span>
        </h2>

        {/* Grilla: 3 arriba + 2 abajo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {novedades.map((novedad) => (
            <Link
              key={novedad.id}
              href={novedad.enlace}
              className="group flex items-center gap-4 bg-oscuro-900 rounded-lg border border-oscuro-700 
                         p-5 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-azul-500/60 transition-all duration-200"
            >
              {/* Imagen */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={novedad.imagen}
                  alt={novedad.titulo}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                  sizes="96px"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-producto.svg";
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] text-azul-600 font-bold uppercase tracking-wider">
                  {novedad.categoria}
                </span>
                <h3 className="text-sm font-semibold text-gray-300 line-clamp-2 
                               group-hover:text-azul-600 transition-colors">
                  {novedad.titulo}
                </h3>
                <span className="text-lg font-bold text-oro-400 mt-1">
                  {formatearPrecio(novedad.precio)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

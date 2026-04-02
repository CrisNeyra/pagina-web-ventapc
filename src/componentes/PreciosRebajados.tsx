"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Producto } from "@/tipos/producto";
import { formatearPrecio } from "@/utils/formato";

interface PreciosRebajadosProps {
  productos: Producto[];
}

// Sección "Los mejores precios rebajados para vos" — carrusel horizontal de tarjetas con descuento
export default function PreciosRebajados({ productos }: PreciosRebajadosProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);

  const desplazar = (dir: "izq" | "der") => {
    if (!contenedorRef.current) return;
    contenedorRef.current.scrollBy({
      left: dir === "der" ? 320 : -320,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-10 md:py-14 bg-oscuro-950">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl text-gray-400">
            Los mejores <span className="font-bold text-white">precios rebajados</span> para vos
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => desplazar("izq")}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-azul-500 
                         text-azul-500 hover:bg-azul-500 hover:text-white transition-all duration-200"
              aria-label="Anterior"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              onClick={() => desplazar("der")}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-azul-500 
                         text-azul-500 hover:bg-azul-500 hover:text-white transition-all duration-200"
              aria-label="Siguiente"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carrusel */}
        <div
          ref={contenedorRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {productos.map((producto) => (
            <Link
              key={producto.id}
              href={`/producto/${producto.id}`}
              className="group flex-shrink-0 w-[280px] bg-oscuro-900 rounded-lg border border-oscuro-700 
                         overflow-hidden hover:shadow-lg hover:border-azul-300 transition-all duration-200"
            >
              {/* Header con badges */}
              <div className="relative">
                {/* Badge descuento */}
                {producto.precioAnterior && (
                  <span className="absolute top-3 left-3 z-10 bg-azul-600 text-white text-xs font-bold 
                                   px-2 py-1 rounded">
                    Descuento
                    <br />
                    <span className="text-sm">
                      {formatearPrecio(producto.precioAnterior - producto.precio)}
                    </span>
                  </span>
                )}

                {/* Etiqueta (PC ARMADA, COMBO, etc.) */}
                {producto.etiqueta && (
                  <span className="absolute top-3 right-3 z-10 bg-oscuro-900 text-white text-[10px] 
                                   font-bold px-2 py-1 uppercase tracking-wider">
                    {producto.etiqueta}
                  </span>
                )}

                {/* Imagen */}
                <div className="relative h-44 bg-oscuro-800">
                  <Image
                    src={producto.imagen}
                    alt={producto.nombre}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    sizes="280px"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-producto.svg";
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-4 min-h-[40px]
                               group-hover:text-azul-600 transition-colors">
                  {producto.nombre}
                </h3>

                {/* Precios */}
                {producto.precioAnterior && (
                  <span className="text-xs text-gray-400 line-through block">
                    {formatearPrecio(producto.precioAnterior)}
                  </span>
                )}
                <span className="text-xl font-bold text-oro-400">
                  {formatearPrecio(producto.precio)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

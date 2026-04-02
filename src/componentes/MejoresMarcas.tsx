"use client";

import { useRef } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { marcas } from "@/datos/navegacion";

// Carrusel de logos de marcas destacadas
export default function MejoresMarcas() {
  const contenedorRef = useRef<HTMLDivElement>(null);

  const desplazar = (dir: "izq" | "der") => {
    if (!contenedorRef.current) return;
    contenedorRef.current.scrollBy({
      left: dir === "der" ? 200 : -200,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-10 md:py-14 border-t border-oscuro-700 bg-oscuro-950">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl text-gray-400">
            Descubrí las <span className="font-bold text-white">mejores marcas</span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => desplazar("izq")}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-azul-500 
                         text-azul-400 hover:bg-azul-500 hover:text-black transition-all duration-200"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              onClick={() => desplazar("der")}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-azul-500 
                         text-azul-400 hover:bg-azul-500 hover:text-black transition-all duration-200"
              aria-label="Siguiente"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carrusel de marcas */}
        <div
          ref={contenedorRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        >
          {marcas.map((marca) => (
            <div
              key={marca.nombre}
              className="flex-shrink-0 w-[140px] h-[70px] flex items-center justify-center 
                         bg-oscuro-800 border border-oscuro-700 rounded-lg px-4 
                         hover:border-azul-500/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] transition-all duration-200 cursor-pointer"
            >
              <Image
                src={marca.logo}
                alt={marca.nombre}
                width={100}
                height={40}
                className="object-contain max-h-[40px] grayscale hover:grayscale-0 transition-all duration-300"
                onError={(e) => {
                  // Si no hay logo, mostrar el nombre
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    (e.target as HTMLImageElement).style.display = "none";
                    parent.innerHTML = `<span class="text-sm font-bold text-gray-600">${marca.nombre}</span>`;
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

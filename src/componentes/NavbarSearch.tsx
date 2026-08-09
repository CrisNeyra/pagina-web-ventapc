"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import { catalogoCompleto } from "@/datos/productos";
import { useBusquedaStore } from "@/store/busquedaStore";
import { formatearPrecio } from "@/utils/formato";
import type { Producto } from "@/tipos/producto";

interface NavbarSearchProps {
  variant: "desktop" | "mobile";
  abierto: boolean;
  onAbrir: () => void;
  onCerrar: () => void;
  onSeleccionar: (nombre: string) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

function ListaSugerencias({
  sugerencias,
  termino,
  prefijo,
  onSeleccionar,
}: {
  sugerencias: Producto[];
  termino: string;
  prefijo: string;
  onSeleccionar: (nombre: string) => void;
}) {
  if (sugerencias.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-cyber-cyan-200/80">
        No se encontraron productos para &quot;{termino}&quot;.
      </p>
    );
  }

  return (
    <ul className="max-h-96 overflow-y-auto">
      {sugerencias.map((producto) => (
        <li
          key={`${prefijo}-${producto.id}`}
          className="border-b border-cyber-purple-500/20 last:border-b-0"
        >
          <Link
            href={`/producto/${producto.id}`}
            onClick={() => onSeleccionar(producto.nombre)}
            className="flex items-center gap-3 p-3 transition-colors hover:bg-cyber-cyan-500/10"
          >
            <div className="relative h-11 w-11 overflow-hidden rounded-md border border-cyber-cyan-500/25 bg-oscuro-800">
              <Image
                src={producto.imagenes[0] ?? "/placeholder-producto.svg"}
                alt={producto.nombre}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{producto.nombre}</p>
              <p className="text-xs font-semibold text-cyber-cyan-300">
                {formatearPrecio(producto.precio)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function NavbarSearch({
  variant,
  abierto,
  onAbrir,
  onCerrar,
  onSeleccionar,
  containerRef,
  formRef,
}: NavbarSearchProps) {
  const terminoBusqueda = useBusquedaStore((state) => state.termino);
  const setTerminoBusqueda = useBusquedaStore((state) => state.setTermino);
  const terminoNormalizado = terminoBusqueda.trim().toLowerCase();

  const sugerencias = useMemo(() => {
    if (!terminoNormalizado) return [];
    return catalogoCompleto
      .filter((producto) => producto.nombre.toLowerCase().includes(terminoNormalizado))
      .slice(0, 6);
  }, [terminoNormalizado]);

  const inputClasses =
    "w-full rounded-md bg-oscuro-900/95 text-cyber-cyan-100 placeholder-cyber-cyan-300/60 px-4 py-2.5 pr-12 text-sm border border-cyber-purple-500/45 focus:outline-none focus:ring-2 focus:ring-cyber-cyan-500 focus:border-cyber-cyan-400 transition-all duration-200";

  const manejarSubmit = (evento: React.FormEvent) => {
    evento.preventDefault();
    onCerrar();
  };

  const dropdown =
    abierto && terminoNormalizado ? (
      <div className="absolute top-full z-[70] mt-2 w-full overflow-hidden rounded-xl border border-cyber-purple-500/40 bg-oscuro-900/98 shadow-[0_0_22px_rgba(168,85,247,0.25)]">
        <ListaSugerencias
          sugerencias={sugerencias}
          termino={terminoBusqueda.trim()}
          prefijo={variant}
          onSeleccionar={onSeleccionar}
        />
      </div>
    ) : null;

  if (variant === "mobile") {
    return (
      <div className="md:hidden px-4 pb-3">
        <form ref={formRef} onSubmit={manejarSubmit} className="relative" role="search">
          <input
            type="search"
            value={terminoBusqueda}
            onFocus={onAbrir}
            onChange={(evento) => {
              setTerminoBusqueda(evento.target.value);
              onAbrir();
            }}
            placeholder="Buscar productos"
            aria-label="Buscar productos"
            className={inputClasses}
          />
          <button
            type="submit"
            className="absolute right-0 top-0 h-full rounded-r-md bg-cyber-purple-500 px-4 text-white hover:bg-cyber-purple-400"
            aria-label="Ejecutar búsqueda"
          >
            <FiSearch size={18} />
          </button>
          {dropdown}
        </form>
      </div>
    );
  }

  return (
    <form
      onSubmit={manejarSubmit}
      className="hidden md:flex flex-1 min-w-[260px] max-w-2xl"
      role="search"
    >
      <div ref={containerRef} className="relative w-full">
        <input
          type="search"
          value={terminoBusqueda}
          onFocus={onAbrir}
          onChange={(evento) => {
            setTerminoBusqueda(evento.target.value);
            onAbrir();
          }}
          placeholder="Buscar productos"
          aria-label="Buscar productos"
          className={inputClasses}
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-full rounded-r-md bg-cyber-purple-500 px-4 text-white transition-colors duration-200 hover:bg-cyber-purple-400"
          aria-label="Ejecutar búsqueda"
        >
          <FiSearch size={18} />
        </button>
        {dropdown}
      </div>
    </form>
  );
}

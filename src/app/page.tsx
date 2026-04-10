"use client";

import HeroVideos from "@/componentes/HeroVideos";
import BarraBeneficios from "@/componentes/BarraBeneficios";
import BannerArmaTuPC from "@/componentes/BannerArmaTuPC";
import GrillaCategorias from "@/componentes/GrillaCategorias";
import ProductCard from "@/componentes/ProductCard";
import NewsCard from "@/componentes/NewsCard";
import BrandsGrid from "@/componentes/BrandsGrid";
import { useBusquedaStore } from "@/store/busquedaStore";
import {
  productosDestacados,
  productosRebajados,
  ultimasNovedades,
} from "@/datos/productos";
import { useMemo } from "react";

export default function PaginaInicio() {
  const terminoBusqueda = useBusquedaStore((state) => state.termino);
  const terminoNormalizado = terminoBusqueda.trim().toLowerCase();
  const hayBusqueda = terminoNormalizado.length > 0;

  const destacadosFiltrados = useMemo(
    () =>
      productosDestacados.filter((producto) =>
        producto.nombre.toLowerCase().includes(terminoNormalizado)
      ),
    [terminoNormalizado]
  );

  const rebajadosFiltrados = useMemo(
    () =>
      productosRebajados.filter((producto) =>
        producto.nombre.toLowerCase().includes(terminoNormalizado)
      ),
    [terminoNormalizado]
  );

  const novedadesFiltradas = useMemo(
    () =>
      ultimasNovedades.filter((novedad) =>
        novedad.titulo.toLowerCase().includes(terminoNormalizado)
      ),
    [terminoNormalizado]
  );

  const noHayResultados =
    hayBusqueda &&
    destacadosFiltrados.length === 0 &&
    rebajadosFiltrados.length === 0 &&
    novedadesFiltradas.length === 0;

  return (
    <main className="flex-1 bg-oscuro-950">
      {/* 1. Hero con videos encadenados + panel promocional */}
      <HeroVideos />

      {/* 2. Barra de beneficios (cuotas, envíos, garantía) */}
      <BarraBeneficios />

      {/* 3. Productos destacados */}
      {(!hayBusqueda || destacadosFiltrados.length > 0) && (
        <section className="mx-auto my-10 max-w-7xl px-4">
          <h2 className="mb-5 text-xl font-bold text-white sm:text-2xl">Productos Destacados</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(hayBusqueda ? destacadosFiltrados : productosDestacados).map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Banner "Armá tu PC" */}
      <BannerArmaTuPC />

      {/* 5. Grilla de categorías */}
      <GrillaCategorias />

      {/* 6. Rebajados */}
      {(!hayBusqueda || rebajadosFiltrados.length > 0) && (
        <section className="mx-auto my-10 max-w-7xl px-4">
          <h2 className="mb-5 text-xl font-bold text-white sm:text-2xl">Precios Rebajados</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(hayBusqueda ? rebajadosFiltrados : productosRebajados).map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Últimas novedades */}
      {(!hayBusqueda || novedadesFiltradas.length > 0) && (
        <section className="mx-auto my-10 max-w-7xl px-4">
          <h2 className="mb-5 text-xl font-bold text-white sm:text-2xl">Últimas Novedades</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(hayBusqueda ? novedadesFiltradas : ultimasNovedades).map((novedad) => (
              <NewsCard key={novedad.id} novedad={novedad} />
            ))}
          </div>
        </section>
      )}

      {noHayResultados && (
        <section className="mx-auto my-10 max-w-7xl px-4">
          <p className="rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-4 text-sm text-cyber-cyan-200/85">
            No se encontraron productos.
          </p>
        </section>
      )}

      {/* 8. Mejores marcas */}
      <BrandsGrid />
    </main>
  );
}

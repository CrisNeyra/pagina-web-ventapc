"use client";

import HeroVideos from "@/componentes/HeroVideos";
import BarraBeneficios from "@/componentes/BarraBeneficios";
import BannerArmaTuPC from "@/componentes/BannerArmaTuPC";
import GrillaCategorias from "@/componentes/GrillaCategorias";
import BrandsGrid from "@/componentes/BrandsGrid";
import ProductCard from "@/componentes/ProductCard";
import { useBusquedaStore } from "@/store/busquedaStore";
import { productosDestacados, productosRebajados } from "@/datos/productos";
import { FiChevronDown } from "react-icons/fi";
import { useMemo, useState } from "react";

function mezclarProductos<T>(productos: T[]): T[] {
  const copia = [...productos];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export default function PaginaInicio() {
  const terminoBusqueda = useBusquedaStore((state) => state.termino);
  const terminoNormalizado = terminoBusqueda.trim().toLowerCase();
  const hayBusqueda = terminoNormalizado.length > 0;
  const [mostrarTodosProductos, setMostrarTodosProductos] = useState(false);

  const productosUnicos = useMemo(() => {
    const mapa = new Map<string, (typeof productosDestacados)[number]>();
    [...productosDestacados, ...productosRebajados].forEach((producto) => {
      if (!mapa.has(producto.id)) {
        mapa.set(producto.id, producto);
      }
    });
    return Array.from(mapa.values());
  }, []);

  const destacadosAleatorios = useMemo(
    () => mezclarProductos(productosDestacados).slice(0, 4),
    []
  );

  const destacadosFiltrados = useMemo(
    () =>
      productosDestacados.filter((producto) =>
        producto.nombre.toLowerCase().includes(terminoNormalizado)
      ),
    [terminoNormalizado]
  );

  const productosFiltrados = useMemo(
    () =>
      productosUnicos.filter((producto) =>
        producto.nombre.toLowerCase().includes(terminoNormalizado)
      ),
    [productosUnicos, terminoNormalizado]
  );

  const productosAleatorios = useMemo(() => {
    const idsDestacados = new Set(destacadosAleatorios.map((producto) => producto.id));
    return mezclarProductos(
      productosUnicos.filter((producto) => !idsDestacados.has(producto.id))
    );
  }, [productosUnicos, destacadosAleatorios]);

  const productosSeccion = hayBusqueda ? productosFiltrados : productosAleatorios;
  const productosVisibles =
    hayBusqueda || mostrarTodosProductos
      ? productosSeccion
      : productosSeccion.slice(0, 12);

  const noHayResultados =
    hayBusqueda && destacadosFiltrados.length === 0 && productosFiltrados.length === 0;

  return (
    <main className="flex-1 bg-background">
      {/* 1. First fold: Hero + beneficios + indicador scroll */}
      <section className="relative grid min-h-[calc(100vh-130px)] grid-rows-[minmax(0,1fr)_auto] bg-background">
        <HeroVideos />
        <BarraBeneficios />
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex items-center justify-center">
          <a
            href="#productos-destacados"
            className="pointer-events-auto flex flex-col items-center gap-1 rounded-full border border-cyber-cyan-500/35 bg-oscuro-950/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-cyber-cyan-300 opacity-60 backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:opacity-100 hover:shadow-[0_0_18px_rgba(109,40,217,0.35)]"
          >
            <span>Desliza para explorar</span>
            <FiChevronDown className="animate-bounce text-cyber-cyan-200" size={16} />
          </a>
        </div>
      </section>

      {/* 2. Marcas destacadas (sobre productos destacados) */}
      <BrandsGrid />

      {/* 3. Productos destacados */}
      {(!hayBusqueda || destacadosFiltrados.length > 0) && (
        <section id="productos-destacados" className="mx-auto mt-10 mb-10 max-w-7xl px-4">
          <h2 className="mb-5 text-xl font-bold text-white sm:text-2xl">Productos Destacados</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(hayBusqueda ? destacadosFiltrados : destacadosAleatorios).map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Productos (12 al azar + ver más) */}
      {(!hayBusqueda || productosFiltrados.length > 0) && (
        <section className="mx-auto my-10 max-w-7xl px-4">
          <h2 className="mb-5 text-xl font-bold text-white sm:text-2xl">Productos</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productosVisibles.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
          {!hayBusqueda && productosSeccion.length > 12 && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setMostrarTodosProductos((previo) => !previo)}
                className="rounded-md border border-cyber-cyan-400/60 bg-cyber-cyan-500/10 px-6 py-2 text-sm font-bold text-cyber-cyan-300 transition-colors hover:bg-cyber-cyan-400 hover:text-oscuro-950"
              >
                {mostrarTodosProductos ? "Ver menos" : "Ver más"}
              </button>
            </div>
          )}
        </section>
      )}

      {/* 5. Banner "Armá tu PC" */}
      <BannerArmaTuPC />

      {/* 6. Grilla de categorías */}
      <GrillaCategorias />

      {noHayResultados && (
        <section className="mx-auto my-10 max-w-7xl px-4">
          <p className="rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-4 text-sm text-cyber-cyan-200/85">
            No se encontraron productos.
          </p>
        </section>
      )}
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/componentes/ProductCard";
import { useProductosFiltrados } from "@/hooks/useProductosFiltrados";
import type { Producto } from "@/tipos/producto";

interface HomeProductosProps {
  productosDestacados: Producto[];
  productosUnicos: Producto[];
}

function obtenerDestacadosIniciales(productos: Producto[]): Producto[] {
  return productos.slice(0, 4);
}

function obtenerProductosIniciales(
  productosUnicos: Producto[],
  destacados: Producto[]
): Producto[] {
  const idsDestacados = new Set(destacados.map((producto) => producto.id));
  return productosUnicos.filter((producto) => !idsDestacados.has(producto.id));
}

export default function HomeProductos({
  productosDestacados,
  productosUnicos,
}: HomeProductosProps) {
  const { productosFiltrados, terminoNormalizado, hayBusqueda } =
    useProductosFiltrados(productosUnicos);
  const [mostrarTodosProductos, setMostrarTodosProductos] = useState(false);
  const destacadosMostrar = useMemo(
    () => obtenerDestacadosIniciales(productosDestacados),
    [productosDestacados]
  );
  const productosMostrar = useMemo(
    () => obtenerProductosIniciales(productosUnicos, destacadosMostrar),
    [productosUnicos, destacadosMostrar]
  );

  const destacadosFiltrados = useMemo(
    () =>
      productosDestacados.filter((producto) =>
        producto.nombre.toLowerCase().includes(terminoNormalizado)
      ),
    [productosDestacados, terminoNormalizado]
  );

  const productosSeccion = hayBusqueda ? productosFiltrados : productosMostrar;
  const productosVisibles =
    hayBusqueda || mostrarTodosProductos
      ? productosSeccion
      : productosSeccion.slice(0, 12);

  const noHayResultados =
    hayBusqueda && destacadosFiltrados.length === 0 && productosFiltrados.length === 0;

  return (
    <>
      {(!hayBusqueda || destacadosFiltrados.length > 0) && (
        <section id="productos-destacados" className="mx-auto mt-12 mb-8 max-w-7xl px-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-ink-cyan">
            Destacados
          </p>
          <h2 className="mb-6 text-2xl font-black text-foreground sm:text-3xl">
            Productos Destacados
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(hayBusqueda ? destacadosFiltrados : destacadosMostrar).map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      )}

      {(!hayBusqueda || productosFiltrados.length > 0) && (
        <section className="mx-auto my-10 max-w-7xl px-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-ink-cyan">
            Catálogo
          </p>
          <h2 className="mb-6 text-2xl font-black text-foreground sm:text-3xl">Productos</h2>
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
                className="btn-cyber-outline rounded-md px-6 py-2 text-sm"
              >
                {mostrarTodosProductos ? "Ver menos" : "Ver más"}
              </button>
            </div>
          )}
        </section>
      )}

      {noHayResultados && (
        <section className="mx-auto my-10 max-w-7xl px-4">
          <p className="rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-4 text-sm text-cyber-cyan-200/85">
            No se encontraron productos.
          </p>
        </section>
      )}
    </>
  );
}

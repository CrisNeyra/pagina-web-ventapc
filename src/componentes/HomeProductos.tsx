"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/componentes/ProductCard";
import { useProductosFiltrados } from "@/hooks/useProductosFiltrados";
import { mezclarProductos } from "@/utils/productos";
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
  const [destacadosAleatorios, setDestacadosAleatorios] = useState(() =>
    obtenerDestacadosIniciales(productosDestacados)
  );
  const [productosAleatorios, setProductosAleatorios] = useState(() =>
    obtenerProductosIniciales(productosUnicos, obtenerDestacadosIniciales(productosDestacados))
  );

  useEffect(() => {
    const destacados = mezclarProductos(productosDestacados).slice(0, 4);
    const idsDestacados = new Set(destacados.map((producto) => producto.id));
    setDestacadosAleatorios(destacados);
    setProductosAleatorios(
      mezclarProductos(
        productosUnicos.filter((producto) => !idsDestacados.has(producto.id))
      )
    );
  }, [productosDestacados, productosUnicos]);

  const destacadosFiltrados = useMemo(
    () =>
      productosDestacados.filter((producto) =>
        producto.nombre.toLowerCase().includes(terminoNormalizado)
      ),
    [productosDestacados, terminoNormalizado]
  );

  const productosSeccion = hayBusqueda ? productosFiltrados : productosAleatorios;
  const productosVisibles =
    hayBusqueda || mostrarTodosProductos
      ? productosSeccion
      : productosSeccion.slice(0, 12);

  const noHayResultados =
    hayBusqueda && destacadosFiltrados.length === 0 && productosFiltrados.length === 0;

  return (
    <>
      {(!hayBusqueda || destacadosFiltrados.length > 0) && (
        <section id="productos-destacados" className="mx-auto mt-10 mb-10 max-w-7xl px-4">
          <h2 className="mb-5 text-xl font-bold text-white sm:text-2xl">
            Productos Destacados
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(hayBusqueda ? destacadosFiltrados : destacadosAleatorios).map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      )}

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

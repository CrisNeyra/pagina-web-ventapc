"use client";

import ProductCard from "@/componentes/ProductCard";
import { useBusquedaStore } from "@/store/busquedaStore";
import { productosDestacados, productosRebajados } from "@/datos/productos";
import { useMemo } from "react";

const todos = [...productosDestacados, ...productosRebajados];

export default function ProductosPage() {
  const terminoBusqueda = useBusquedaStore((state) => state.termino);
  const terminoNormalizado = terminoBusqueda.trim().toLowerCase();

  const productosFiltrados = useMemo(() => {
    if (!terminoNormalizado) return todos;
    return todos.filter((producto) =>
      producto.nombre.toLowerCase().includes(terminoNormalizado)
    );
  }, [terminoNormalizado]);

  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-5 text-3xl font-black text-white">Productos</h1>
        {productosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productosFiltrados.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-4 text-sm text-cyber-cyan-200/85">
            No se encontraron productos.
          </p>
        )}
      </section>
    </main>
  );
}

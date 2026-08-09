"use client";

import ProductCard from "@/componentes/ProductCard";
import { useProductosFiltrados } from "@/hooks/useProductosFiltrados";
import type { Producto } from "@/tipos/producto";

interface ProductosListadoProps {
  productos: Producto[];
  titulo: string;
  mensajeVacio?: string;
}

export default function ProductosListado({
  productos,
  titulo,
  mensajeVacio = "No se encontraron productos.",
}: ProductosListadoProps) {
  const { productosFiltrados } = useProductosFiltrados(productos);

  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-5 text-3xl font-black text-white">{titulo}</h1>
        {productosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productosFiltrados.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-4 text-sm text-cyber-cyan-200/85">
            {mensajeVacio}
          </p>
        )}
      </section>
    </main>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import TarjetaProducto from "./TarjetaProducto";
import { Producto } from "@/tipos/producto";

interface ProductosDestacadosProps {
  productos: Producto[];
  categorias: string[];
}

const PRODUCTOS_POR_PAGINA = 6; // grilla 3x2

export default function ProductosDestacados({
  productos,
  categorias,
}: ProductosDestacadosProps) {
  const [categoriaActiva, setCategoriaActiva] = useState(categorias[0]);
  const [paginaActual, setPaginaActual] = useState(0);

  // Filtrar por categoría
  const productosFiltrados = productos.filter(
    (p) => p.categoria === categoriaActiva
  );

  // Paginar
  const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA);
  const productosVisibles = productosFiltrados.slice(
    paginaActual * PRODUCTOS_POR_PAGINA,
    (paginaActual + 1) * PRODUCTOS_POR_PAGINA
  );

  const cambiarCategoria = (cat: string) => {
    setCategoriaActiva(cat);
    setPaginaActual(0);
  };

  const paginaAnterior = () => {
    setPaginaActual((prev) => Math.max(0, prev - 1));
  };

  const paginaSiguiente = () => {
    setPaginaActual((prev) => Math.min(totalPaginas - 1, prev + 1));
  };

  return (
    <section className="py-10 md:py-14 bg-oscuro-950">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado con título y flechas */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl text-gray-400">
            Conocé nuestros <span className="font-bold text-white">productos destacados</span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={paginaAnterior}
              disabled={paginaActual === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-azul-500 
                         text-azul-400 hover:bg-azul-500 hover:text-black disabled:border-oscuro-700 
                         disabled:text-oscuro-600 disabled:hover:bg-transparent transition-all duration-200"
              aria-label="Página anterior"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              onClick={paginaSiguiente}
              disabled={paginaActual >= totalPaginas - 1}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-azul-500 
                         text-azul-400 hover:bg-azul-500 hover:text-black disabled:border-oscuro-700 
                         disabled:text-oscuro-600 disabled:hover:bg-transparent transition-all duration-200"
              aria-label="Página siguiente"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ── Tabs de categorías (estilo Compra Gamer) ── */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => cambiarCategoria(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap border
                         transition-all duration-200 ${
                           categoriaActiva === cat
                             ? "bg-gradient-to-r from-azul-600 to-oro-500 text-white border-transparent shadow-md"
                             : "bg-oscuro-800 text-gray-400 border-oscuro-700 hover:border-azul-500 hover:text-azul-400"
                         }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Grilla 3x2 de productos ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${categoriaActiva}-${paginaActual}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {productosVisibles.map((producto) => (
              <TarjetaProducto key={producto.id} producto={producto} />
            ))}

            {productosVisibles.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                No hay productos en esta categoría todavía.
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Indicadores de página (puntos) ── */}
        {totalPaginas > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPaginas }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPaginaActual(i)}
                aria-label={`Página ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === paginaActual
                    ? "bg-gradient-to-r from-azul-500 to-oro-500 w-4 h-3"
                    : "bg-oscuro-700 hover:bg-oscuro-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import type { Producto } from "@/tipos/producto";
import { formatearPrecio } from "@/utils/formato";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

interface ProductCardProps {
  producto: Producto;
}

export default function ProductCard({ producto }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const agregarAlCarrito = () => {
    if (!producto.enStock) {
      toast.error("Este producto no tiene stock disponible.");
      return;
    }
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      enStock: producto.enStock,
    });
    toast.success(`✅ ${producto.nombre} agregado al carrito`);
  };

  return (
    <article className="group rounded-xl border border-cyber-purple-500/30 bg-oscuro-900/80 p-4 transition-all duration-200 hover:border-cyber-cyan-400/70 hover:shadow-[0_0_24px_rgba(34,211,238,0.18)]">
      <Link href={`/producto/${producto.id}`} className="block">
        <div className="relative mb-4 h-44 w-full overflow-hidden rounded-xl bg-oscuro-800">
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded-md border border-cyber-cyan-500/30 bg-cyber-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyber-cyan-300">
            {producto.categoria}
          </span>
          <span
            className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
              producto.enStock
                ? "bg-cyber-lime-400/20 text-cyber-lime-400"
                : "bg-cyber-pink-500/20 text-cyber-pink-400"
            }`}
          >
            {producto.enStock ? "En stock" : "Sin stock"}
          </span>
        </div>

        <h3 className="line-clamp-2 min-h-[3rem] text-sm font-semibold text-white">
          {producto.nombre}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-cyber-cyan-100/75">
          {producto.descripcion}
        </p>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-extrabold text-cyber-cyan-300">
            {formatearPrecio(producto.precio)}
          </span>
          {producto.precioAnterior && (
            <span className="text-xs text-gray-400 line-through">
              {formatearPrecio(producto.precioAnterior)}
            </span>
          )}
        </div>
      </Link>
      <button
        type="button"
        onClick={agregarAlCarrito}
        className="mt-3 w-full rounded-md border border-cyber-cyan-400/60 bg-cyber-cyan-500/10 px-3 py-2 text-sm font-bold text-cyber-cyan-300 transition-colors hover:bg-cyber-cyan-400 hover:text-oscuro-950"
      >
        Agregar al carrito
      </button>
    </article>
  );
}

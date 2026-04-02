"use client";

import Image from "next/image";
import Link from "next/link";
import { Producto } from "@/tipos/producto";
import { formatearPrecio } from "@/utils/formato";

// ── REDUX: importar hook y acción ──
// import { useAppDispatch } from "@/store/hooks";
// import { agregarAlCarrito } from "@/store/carritoSlice";

interface TarjetaProductoProps {
  producto: Producto;
}

// Tarjeta horizontal estilo Compra Gamer: imagen a la izquierda, info a la derecha
export default function TarjetaProducto({ producto }: TarjetaProductoProps) {
  // ── REDUX: inicializar dispatch ──
  // const dispatch = useAppDispatch();

  const manejarClick = () => {
    // ── REDUX: despachar acción para agregar producto al carrito ──
    // dispatch(agregarAlCarrito(producto));
    console.log("Agregado al carrito:", producto.nombre);
  };

  return (
    <Link
      href={`/producto/${producto.id}`}
      className="group flex items-center gap-4 bg-oscuro-900 rounded-lg border border-oscuro-700 
                 p-4 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-azul-500/60 transition-all duration-200 h-full"
    >
      {/* Imagen */}
      <div className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 bg-oscuro-800">
        <Image
          src={producto.imagen}
          alt={producto.nombre}
          fill
          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          sizes="120px"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-producto.svg";
          }}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        {/* Nombre del producto */}
        <h3 className="text-sm font-medium text-gray-300 line-clamp-3 leading-snug 
                       group-hover:text-azul-400 transition-colors duration-200">
          {producto.nombre}
        </h3>

        {/* Precio */}
        <div className="mt-auto pt-2">
          <span className="text-xl font-bold text-oro-400">
            {formatearPrecio(producto.precio)}
          </span>
        </div>
      </div>

      {/*
        ── INTEGRACIÓN CON REDUX ──
        
        Para conectar con el store global del carrito:
        
        1. Descomentar los imports de useAppDispatch y agregarAlCarrito arriba
        2. Descomentar: const dispatch = useAppDispatch();
        3. En manejarClick(): dispatch(agregarAlCarrito(producto));
        4. El Navbar actualiza automáticamente el badge del carrito
      */}
    </Link>
  );
}

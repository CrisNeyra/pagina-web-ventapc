"use client";

import { useMemo } from "react";
import { useBusquedaStore } from "@/store/busquedaStore";
import { filtrarProductosPorNombre } from "@/utils/productos";
import type { Producto } from "@/tipos/producto";

export function useProductosFiltrados(productos: Producto[]) {
  const terminoBusqueda = useBusquedaStore((state) => state.termino);
  const terminoNormalizado = terminoBusqueda.trim().toLowerCase();
  const hayBusqueda = terminoNormalizado.length > 0;

  const productosFiltrados = useMemo(
    () => filtrarProductosPorNombre(productos, terminoNormalizado),
    [productos, terminoNormalizado]
  );

  return { productosFiltrados, terminoNormalizado, hayBusqueda };
}

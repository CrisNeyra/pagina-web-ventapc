"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { builderCategories, defaultBuilderCategory } from "@/datos/pcBuilder";
import type {
  BuilderCategoryId,
  BuilderProduct,
} from "@/tipos/pcBuilder";

type SeleccionPorCategoria = Partial<Record<BuilderCategoryId, BuilderProduct>>;

interface BuilderState {
  categoriaActiva: BuilderCategoryId;
  seleccion: SeleccionPorCategoria;
  setCategoriaActiva: (categoria: BuilderCategoryId) => void;
  seleccionarProducto: (producto: BuilderProduct) => void;
  quitarProducto: (categoria: BuilderCategoryId) => void;
  limpiarBuild: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      categoriaActiva: defaultBuilderCategory,
      seleccion: {},
      setCategoriaActiva: (categoria) => set({ categoriaActiva: categoria }),
      seleccionarProducto: (producto) =>
        set((state) => ({
          seleccion: {
            ...state.seleccion,
            [producto.categoria]: producto,
          },
        })),
      quitarProducto: (categoria) =>
        set((state) => {
          const nuevaSeleccion = { ...state.seleccion };
          delete nuevaSeleccion[categoria];
          return { seleccion: nuevaSeleccion };
        }),
      limpiarBuild: () => set({ seleccion: {}, categoriaActiva: defaultBuilderCategory }),
    }),
    {
      name: "pc-builder-storage",
      partialize: (state) => ({
        categoriaActiva: state.categoriaActiva,
        seleccion: state.seleccion,
      }),
    }
  )
);

export function calcularSubtotalBuilder(seleccion: SeleccionPorCategoria): number {
  return builderCategories.reduce((total, categoria) => {
    return total + (seleccion[categoria.id]?.precio ?? 0);
  }, 0);
}

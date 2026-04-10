"use client";

import { create } from "zustand";

interface EstadoBusqueda {
  termino: string;
  setTermino: (valor: string) => void;
  limpiar: () => void;
}

export const useBusquedaStore = create<EstadoBusqueda>((set) => ({
  termino: "",
  setTermino: (valor) => set({ termino: valor }),
  limpiar: () => set({ termino: "" }),
}));

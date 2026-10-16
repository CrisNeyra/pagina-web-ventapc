"use client";

import { create } from "zustand";

export interface CartProduct {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  enStock?: boolean;
}

export interface CartItem {
  producto: CartProduct;
  cantidad: number;
}

interface CartState {
  usuarioId: string | null;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  vincularUsuario: (usuarioId: string | null) => void;
  addItem: (producto: CartProduct, cantidad?: number) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
}

export function claveCarrito(usuarioId: string) {
  return `venta-pc-cart:${usuarioId}`;
}

function calcularTotales(items: CartItem[]) {
  return items.reduce(
    (acc, item) => {
      acc.totalItems += item.cantidad;
      acc.subtotal += item.producto.precio * item.cantidad;
      return acc;
    },
    { totalItems: 0, subtotal: 0 }
  );
}

function normalizarItems(items: CartItem[]): CartItem[] {
  return items
    .filter(
      (item) =>
        Boolean(item?.producto?.id) &&
        Boolean(item?.producto?.nombre) &&
        Number.isFinite(item?.producto?.precio)
    )
    .map((item) => ({
      ...item,
      cantidad: Math.max(1, Number.isFinite(item.cantidad) ? item.cantidad : 1),
    }));
}

function leerCarrito(usuarioId: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(claveCarrito(usuarioId));
    if (!raw) return [];
    const datos = JSON.parse(raw) as { items?: CartItem[] };
    return normalizarItems(Array.isArray(datos.items) ? datos.items : []);
  } catch {
    return [];
  }
}

function guardarCarrito(usuarioId: string | null, items: CartItem[]) {
  if (!usuarioId || typeof window === "undefined") return;
  const { totalItems, subtotal } = calcularTotales(items);
  localStorage.setItem(
    claveCarrito(usuarioId),
    JSON.stringify({ items, totalItems, subtotal })
  );
}

const vacio = { items: [] as CartItem[], totalItems: 0, subtotal: 0 };

export const useCartStore = create<CartState>()((set, get) => ({
  usuarioId: null,
  ...vacio,
  vincularUsuario: (usuarioId) => {
    const previo = get().usuarioId;
    if (previo === usuarioId) return;
    if (previo) guardarCarrito(previo, get().items);
    if (!usuarioId) {
      set({ usuarioId: null, ...vacio });
      return;
    }
    const items = leerCarrito(usuarioId);
    const { totalItems, subtotal } = calcularTotales(items);
    set({ usuarioId, items, totalItems, subtotal });
  },
  addItem: (producto, cantidad = 1) => {
    const usuarioId = get().usuarioId;
    if (!usuarioId) return false;
    if (producto.enStock === false) return false;

    const prevItems = normalizarItems(get().items);
    const existente = prevItems.find((item) => item.producto.id === producto.id);

    const items = existente
      ? prevItems.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      : [...prevItems, { producto, cantidad }];

    const { totalItems, subtotal } = calcularTotales(items);
    set({ items, totalItems, subtotal });
    guardarCarrito(usuarioId, items);
    return true;
  },
  removeItem: (productId) => {
    const usuarioId = get().usuarioId;
    const items = normalizarItems(get().items).filter(
      (item) => item.producto.id !== productId
    );
    const { totalItems, subtotal } = calcularTotales(items);
    set({ items, totalItems, subtotal });
    guardarCarrito(usuarioId, items);
  },
  updateQuantity: (productId, cantidad) => {
    const usuarioId = get().usuarioId;
    const fixedQty = Math.max(1, cantidad);
    const items = normalizarItems(get().items).map((item) =>
      item.producto.id === productId ? { ...item, cantidad: fixedQty } : item
    );
    const { totalItems, subtotal } = calcularTotales(items);
    set({ items, totalItems, subtotal });
    guardarCarrito(usuarioId, items);
  },
  clearCart: () => {
    const usuarioId = get().usuarioId;
    set(vacio);
    guardarCarrito(usuarioId, []);
  },
}));

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (producto: CartProduct, cantidad?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      addItem: (producto, cantidad = 1) => {
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
      },
      removeItem: (productId) => {
        const items = normalizarItems(get().items).filter(
          (item) => item.producto.id !== productId
        );
        const { totalItems, subtotal } = calcularTotales(items);
        set({ items, totalItems, subtotal });
      },
      updateQuantity: (productId, cantidad) => {
        const fixedQty = Math.max(1, cantidad);
        const items = normalizarItems(get().items).map((item) =>
          item.producto.id === productId ? { ...item, cantidad: fixedQty } : item
        );
        const { totalItems, subtotal } = calcularTotales(items);
        set({ items, totalItems, subtotal });
      },
      clearCart: () => set({ items: [], totalItems: 0, subtotal: 0 }),
    }),
    {
      name: "venta-pc-cart",
      storage: createJSONStorage(() => localStorage),
      merge: (persistido, actual) => {
        const estadoPersistido = persistido as Partial<CartState>;
        const itemsNormalizados = normalizarItems(estadoPersistido.items ?? []);
        const { totalItems, subtotal } = calcularTotales(itemsNormalizados);
        return {
          ...actual,
          ...estadoPersistido,
          items: itemsNormalizados,
          totalItems,
          subtotal,
        };
      },
    }
  )
);

"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCartStore } from "@/store/cartStore";

/** Carga el carrito del usuario logueado y lo vacía al cerrar sesión. */
export default function CartSesion() {
  const { user, loading } = useAuth();
  const vincularUsuario = useCartStore((estado) => estado.vincularUsuario);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      localStorage.removeItem("venta-pc-cart");
    }
    vincularUsuario(user?.uid ?? null);
  }, [loading, user, vincularUsuario]);

  return null;
}

"use client";

import Link from "next/link";
import { FiUser, FiShoppingCart, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import type { AuthUser } from "@/tipos/auth-user";

interface NavbarActionsProps {
  user: AuthUser | null;
  totalItems: number;
  menuAbierto: boolean;
  carritoAbierto: boolean;
  onAbrirAuth: () => void;
  onAbrirCarrito: () => void;
  onCerrarSesion: () => void;
  onToggleMenu: () => void;
}

export default function NavbarActions({
  user,
  totalItems,
  menuAbierto,
  carritoAbierto,
  onAbrirAuth,
  onAbrirCarrito,
  onCerrarSesion,
  onToggleMenu,
}: NavbarActionsProps) {
  const badge = totalItems > 99 ? "99+" : String(totalItems);

  return (
    <div className="flex items-center gap-5">
      {user ? (
        <Link
          href="/usuario"
          className="nav-action-cyber hidden items-center gap-2 text-sm md:flex"
          aria-label="Ir al perfil de usuario"
        >
          <FiUser size={22} />
          <span className="hidden lg:inline">Usuario</span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={onAbrirAuth}
          className="nav-action-cyber hidden items-center gap-2 text-sm md:flex"
          aria-label="Ingresar como usuario"
        >
          <FiUser size={22} />
          <span className="hidden lg:inline">Usuario</span>
        </button>
      )}

      <button
        type="button"
        onClick={onAbrirCarrito}
        className="nav-action-cyber relative"
        aria-label={totalItems > 0 ? `Abrir carrito, ${totalItems} productos` : "Abrir carrito"}
        aria-expanded={carritoAbierto}
        aria-controls="carrito-drawer"
      >
        <FiShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-magenta px-1 font-mono text-[10px] font-bold text-white">
            {badge}
          </span>
        )}
      </button>

      {user && (
        <button
          type="button"
          onClick={onCerrarSesion}
          className="nav-action-cyber hidden items-center gap-2 text-sm md:flex"
          aria-label="Cerrar sesión"
        >
          <FiLogOut size={20} />
          <span className="hidden lg:inline">Salir</span>
        </button>
      )}

      <button
        type="button"
        onClick={onToggleMenu}
        className="p-1 text-foreground md:hidden"
        aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuAbierto}
      >
        {menuAbierto ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
    </div>
  );
}

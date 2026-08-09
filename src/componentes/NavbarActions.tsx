"use client";

import Link from "next/link";
import { FiUser, FiShoppingCart, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import type { User } from "firebase/auth";

interface NavbarActionsProps {
  user: User | null;
  totalItems: number;
  menuAbierto: boolean;
  onAbrirAuth: () => void;
  onAbrirCarrito: () => void;
  onCerrarSesion: () => void;
  onToggleMenu: () => void;
}

export default function NavbarActions({
  user,
  totalItems,
  menuAbierto,
  onAbrirAuth,
  onAbrirCarrito,
  onCerrarSesion,
  onToggleMenu,
}: NavbarActionsProps) {
  return (
    <div className="flex items-center gap-5">
      {user ? (
        <Link
          href="/usuario"
          className="hidden md:flex items-center gap-2 text-sm text-cyber-cyan-200/75 transition-colors duration-200 hover:text-cyber-cyan-100"
          aria-label="Ir al perfil de usuario"
        >
          <FiUser size={22} />
          <span className="hidden lg:inline">Usuario</span>
        </Link>
      ) : (
        <button
          onClick={onAbrirAuth}
          className="hidden md:flex items-center gap-2 text-sm text-cyber-cyan-200/75 transition-colors duration-200 hover:text-cyber-cyan-100"
          aria-label="Ingresar como usuario"
        >
          <FiUser size={22} />
          <span className="hidden lg:inline">Usuario</span>
        </button>
      )}

      <button
        type="button"
        onClick={onAbrirCarrito}
        className="relative text-cyber-cyan-200/75 transition-colors duration-200 hover:text-cyber-cyan-100"
        aria-label="Abrir carrito"
      >
        <FiShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyber-pink-500 text-[10px] font-bold text-white">
            {totalItems}
          </span>
        )}
      </button>

      {user && (
        <button
          onClick={onCerrarSesion}
          className="hidden md:flex items-center gap-2 text-sm text-cyber-cyan-200/75 transition-colors duration-200 hover:text-cyber-cyan-100"
          aria-label="Cerrar sesión"
        >
          <FiLogOut size={20} />
          <span className="hidden lg:inline">Salir</span>
        </button>
      )}

      <button
        onClick={onToggleMenu}
        className="p-1 text-white md:hidden"
        aria-label="Abrir menú"
      >
        {menuAbierto ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
    </div>
  );
}

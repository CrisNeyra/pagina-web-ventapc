"use client";

import Link from "next/link";
import { FiUser, FiShoppingCart, FiLogOut } from "react-icons/fi";
import { enlacesNavegacion } from "@/datos/navegacion";
import type { User } from "firebase/auth";

interface NavbarMenuProps {
  menuAbierto: boolean;
  user: User | null;
  onCerrarMenu: () => void;
  onAbrirAuth: () => void;
  onAbrirCarrito: () => void;
  onCerrarSesion: () => void;
}

export default function NavbarMenu({
  menuAbierto,
  user,
  onCerrarMenu,
  onAbrirAuth,
  onAbrirCarrito,
  onCerrarSesion,
}: NavbarMenuProps) {
  return (
    <>
      <nav className="hidden border-t border-cyber-purple-500/25 bg-oscuro-900 md:block">
        <div className="mx-auto max-w-7xl px-4">
          <ul className="flex items-center justify-center gap-0">
            {enlacesNavegacion.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  className="block whitespace-nowrap px-8 py-3 text-sm font-medium text-cyber-cyan-200/80 transition-all duration-200 hover:bg-cyber-purple-500/10 hover:text-cyber-cyan-100"
                >
                  {enlace.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {menuAbierto && (
        <nav className="border-t border-cyber-purple-500/25 bg-oscuro-900 md:hidden">
          <ul className="flex flex-col py-2">
            {enlacesNavegacion.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  onClick={onCerrarMenu}
                  className="block px-6 py-3 text-sm text-cyber-cyan-200/80 transition-colors duration-200 hover:bg-cyber-purple-500/10 hover:text-cyber-cyan-100"
                >
                  {enlace.nombre}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-cyber-purple-500/25 pt-2">
              {user ? (
                <Link
                  href="/usuario"
                  onClick={onCerrarMenu}
                  className="flex w-full items-center gap-2 px-6 py-3 text-sm text-cyber-cyan-200/80 hover:text-cyber-cyan-100"
                >
                  <FiUser size={18} />
                  Usuario
                </Link>
              ) : (
                <button
                  onClick={() => {
                    onCerrarMenu();
                    onAbrirAuth();
                  }}
                  className="flex w-full items-center gap-2 px-6 py-3 text-sm text-cyber-cyan-200/80 hover:text-cyber-cyan-100"
                >
                  <FiUser size={18} />
                  Usuario
                </button>
              )}
            </li>
            <li>
              <button
                onClick={() => {
                  onCerrarMenu();
                  onAbrirCarrito();
                }}
                className="flex w-full items-center gap-2 px-6 py-3 text-sm text-cyber-cyan-200/80 hover:text-cyber-cyan-100"
              >
                <FiShoppingCart size={18} />
                Carrito
              </button>
            </li>
            <li className="mt-2 border-t border-cyber-purple-500/25 pt-2">
              {user && (
                <button
                  onClick={() => {
                    onCerrarMenu();
                    onCerrarSesion();
                  }}
                  className="flex w-full items-center gap-2 px-6 py-3 text-sm text-cyber-cyan-200/80 hover:text-cyber-cyan-100"
                >
                  <FiLogOut size={18} />
                  Salir
                </button>
              )}
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}

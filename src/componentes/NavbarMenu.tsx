"use client";

import Link from "next/link";
import { FiUser, FiShoppingCart, FiLogOut } from "react-icons/fi";
import { enlacesNavegacion } from "@/datos/navegacion";
import type { AuthUser } from "@/tipos/auth-user";

interface NavbarMenuProps {
  menuAbierto: boolean;
  user: AuthUser | null;
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
                  className="nav-link-cyber block whitespace-nowrap px-8 py-3 text-sm"
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
                  className="nav-link-cyber block px-6 py-3 text-sm"
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
                  className="nav-action-cyber flex w-full items-center gap-2 px-6 py-3 text-sm"
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
                  className="nav-action-cyber flex w-full items-center gap-2 px-6 py-3 text-sm"
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
                className="nav-action-cyber flex w-full items-center gap-2 px-6 py-3 text-sm"
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
                  className="nav-action-cyber flex w-full items-center gap-2 px-6 py-3 text-sm"
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

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { enlacesNavegacion } from "@/datos/navegacion";
import AuthModal from "@/componentes/AuthModal";
import CartDrawer from "@/componentes/CartDrawer";
import { useAuth } from "@/context/AuthContext";
import { useCartStore } from "@/store/cartStore";
import { useBusquedaStore } from "@/store/busquedaStore";
import { toast } from "sonner";

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [authModalAbierto, setAuthModalAbierto] = useState(false);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const { user, signOut } = useAuth();
  const totalItems = useCartStore((state) => state.totalItems);
  const terminoBusqueda = useBusquedaStore((state) => state.termino);
  const setTerminoBusqueda = useBusquedaStore((state) => state.setTermino);

  const manejarBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const cerrarSesion = async () => {
    const error = await signOut();
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Sesión cerrada.");
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-[0_0_24px_rgba(168,85,247,0.18)]">
      {/* ── Barra principal (fondo oscuro) ── */}
      <div className="bg-oscuro-950/95 backdrop-blur-md border-b border-cyber-purple-500/35">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Nuevo logo a la izquierda del buscador */}
            <Link
              href="/"
              aria-label="Ir al inicio"
              className="w-[180px] max-w-[200px] flex-shrink-0"
            >
              <Image
                src="/logo.jpg"
                alt="Logo principal de la tienda"
                width={480}
                height={200}
                preload
                className="h-[72px] w-full object-contain rounded-md border border-cyber-cyan-500/45 bg-oscuro-900/85 px-2 py-1 drop-shadow-[0_0_18px_rgba(34,211,238,0.55)]"
              />
            </Link>

            {/* Barra de búsqueda (desktop) */}
            <form
              onSubmit={manejarBusqueda}
              className="hidden md:flex flex-1 min-w-[260px] max-w-2xl"
              role="search"
            >
              <div className="relative w-full">
                <input
                  type="search"
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  placeholder="Buscar productos"
                  aria-label="Buscar productos"
                  className="w-full rounded-md bg-oscuro-900/95 text-cyber-cyan-100
                           placeholder-cyber-cyan-300/60 px-4 py-2.5 pr-12 text-sm border border-cyber-purple-500/45
                           focus:outline-none focus:ring-2 focus:ring-cyber-cyan-500 focus:border-cyber-cyan-400
                           transition-all duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full bg-cyber-purple-500 hover:bg-cyber-purple-400
                           text-white px-4 rounded-r-md transition-colors duration-200"
                  aria-label="Ejecutar búsqueda"
                >
                  <FiSearch size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* Iconos de acción */}
          <div className="flex items-center gap-5">
            {/* Mi cuenta */}
            {user ? (
              <button
                onClick={cerrarSesion}
                className="hidden md:flex items-center gap-2 text-cyber-cyan-200/75 hover:text-cyber-cyan-100 transition-colors duration-200 text-sm"
                aria-label="Cerrar sesión"
              >
                <FiUser size={22} />
                <span className="hidden lg:inline">Salir</span>
              </button>
            ) : (
              <button
                onClick={() => setAuthModalAbierto(true)}
                className="hidden md:flex items-center gap-2 text-cyber-cyan-200/75 hover:text-cyber-cyan-100 transition-colors duration-200 text-sm"
                aria-label="Ingresar o registrarse"
              >
                <FiUser size={22} />
                <span className="hidden lg:inline">Ingresá</span>
              </button>
            )}

            {/* Carrito */}
            <button
              type="button"
              onClick={() => setDrawerAbierto(true)}
              className="relative text-cyber-cyan-200/75 hover:text-cyber-cyan-100 transition-colors duration-200"
              aria-label="Abrir carrito"
            >
              <FiShoppingCart size={24} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-2 -right-2.5 bg-cyber-pink-500 text-white text-[10px] font-bold
                              w-5 h-5 flex items-center justify-center rounded-full"
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* Botón menú mobile */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="md:hidden text-white p-1"
              aria-label="Abrir menú"
            >
              {menuAbierto ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* ── Barra de búsqueda mobile ── */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={manejarBusqueda} className="relative" role="search">
            <input
              type="search"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              placeholder="Buscar productos"
              aria-label="Buscar productos"
              className="w-full rounded-md bg-oscuro-900/95 text-cyber-cyan-100
                         placeholder-cyber-cyan-300/60 px-4 py-2.5 pr-12 text-sm border border-cyber-purple-500/45
                         focus:outline-none focus:ring-2 focus:ring-cyber-cyan-500"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full bg-cyber-purple-500
                         hover:bg-cyber-purple-400 text-white px-4 rounded-r-md"
              aria-label="Ejecutar búsqueda"
            >
              <FiSearch size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* ── Navegación secundaria ── */}
      <nav className="hidden md:block bg-oscuro-900 border-t border-cyber-purple-500/25">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center justify-center gap-0">
            {enlacesNavegacion.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  className="block px-8 py-3 text-sm font-medium text-cyber-cyan-200/80 hover:text-cyber-cyan-100
                             hover:bg-cyber-purple-500/10 transition-all duration-200 whitespace-nowrap"
                >
                  {enlace.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Menú mobile ── */}
      {menuAbierto && (
        <nav className="md:hidden bg-oscuro-900 border-t border-cyber-purple-500/25">
          <ul className="flex flex-col py-2">
            {enlacesNavegacion.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  onClick={() => setMenuAbierto(false)}
                  className="block px-6 py-3 text-sm text-cyber-cyan-200/80 hover:text-cyber-cyan-100
                             hover:bg-cyber-purple-500/10 transition-colors duration-200"
                >
                  {enlace.nombre}
                </Link>
              </li>
            ))}
            <li className="border-t border-cyber-purple-500/25 mt-2 pt-2">
              <button
                onClick={() => {
                  setMenuAbierto(false);
                  if (user) {
                    void cerrarSesion();
                  } else {
                    setAuthModalAbierto(true);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 text-sm text-cyber-cyan-200/80 hover:text-cyber-cyan-100 w-full"
              >
                <FiUser size={18} />
                {user ? "Salir" : "Ingresá"}
              </button>
            </li>
          </ul>
        </nav>
      )}

      <AuthModal
        abierto={authModalAbierto}
        onCerrar={() => setAuthModalAbierto(false)}
        onAutenticado={() => setAuthModalAbierto(false)}
      />
      <CartDrawer abierto={drawerAbierto} onCerrar={() => setDrawerAbierto(false)} />
    </header>
  );
}

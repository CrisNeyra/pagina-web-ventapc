"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AuthModal from "@/componentes/AuthModal";
import CartDrawer from "@/componentes/CartDrawer";
import NavbarActions from "@/componentes/NavbarActions";
import NavbarMenu from "@/componentes/NavbarMenu";
import NavbarSearch from "@/componentes/NavbarSearch";
import { useAuth } from "@/context/AuthContext";
import { useCartStore } from "@/store/cartStore";
import { useBusquedaStore } from "@/store/busquedaStore";
import { toast } from "sonner";

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [authModalAbierto, setAuthModalAbierto] = useState(false);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [sugerenciasDesktopAbiertas, setSugerenciasDesktopAbiertas] = useState(false);
  const [sugerenciasMobileAbiertas, setSugerenciasMobileAbiertas] = useState(false);
  const desktopBusquedaRef = useRef<HTMLDivElement | null>(null);
  const mobileBusquedaRef = useRef<HTMLFormElement | null>(null);

  const { user, signOut } = useAuth();
  const totalItems = useCartStore((state) => state.totalItems);
  const limpiarBusqueda = useBusquedaStore((state) => state.limpiar);
  const setTerminoBusqueda = useBusquedaStore((state) => state.setTermino);

  const cerrarSugerencias = () => {
    setSugerenciasDesktopAbiertas(false);
    setSugerenciasMobileAbiertas(false);
  };

  const seleccionarSugerencia = (nombre: string) => {
    setTerminoBusqueda(nombre);
    setMenuAbierto(false);
    cerrarSugerencias();
  };

  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickEnDesktop =
        desktopBusquedaRef.current && desktopBusquedaRef.current.contains(target);
      const clickEnMobile =
        mobileBusquedaRef.current && mobileBusquedaRef.current.contains(target);

      if (!clickEnDesktop && !clickEnMobile) {
        cerrarSugerencias();
      }
    };

    const manejarEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") cerrarSugerencias();
    };

    document.addEventListener("mousedown", manejarClickFuera);
    document.addEventListener("keydown", manejarEscape);
    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
      document.removeEventListener("keydown", manejarEscape);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") !== "required") return;

    setAuthModalAbierto(true);
    toast.error("Iniciá sesión para continuar.");

    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    url.searchParams.delete("redirect");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, []);

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
      <div className="border-b border-cyber-purple-500/35 bg-oscuro-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Link
              href="/"
              onClick={() => {
                limpiarBusqueda();
                setMenuAbierto(false);
              }}
              aria-label="Ir al inicio"
              className="group w-[170px] flex-shrink-0 sm:w-[188px] md:w-[208px]"
              title="Ir al inicio"
            >
              <Image
                src="/logo.jpg"
                alt="Logo principal de la tienda"
                width={480}
                height={200}
                preload
                className="h-[70px] w-full rounded-[15%] object-contain transition-all duration-300 ease-out group-hover:z-10 group-hover:scale-110 group-hover:shadow-[0_0_28px_rgba(34,211,238,0.55)] sm:h-[76px] md:h-[83px]"
              />
            </Link>

            <NavbarSearch
              variant="desktop"
              abierto={sugerenciasDesktopAbiertas}
              onAbrir={() => setSugerenciasDesktopAbiertas(true)}
              onCerrar={cerrarSugerencias}
              onSeleccionar={seleccionarSugerencia}
              containerRef={desktopBusquedaRef}
            />
          </div>

          <NavbarActions
            user={user}
            totalItems={totalItems}
            menuAbierto={menuAbierto}
            onAbrirAuth={() => setAuthModalAbierto(true)}
            onAbrirCarrito={() => setDrawerAbierto(true)}
            onCerrarSesion={() => void cerrarSesion()}
            onToggleMenu={() => setMenuAbierto((previo) => !previo)}
          />
        </div>

        <NavbarSearch
          variant="mobile"
          abierto={sugerenciasMobileAbiertas}
          onAbrir={() => setSugerenciasMobileAbiertas(true)}
          onCerrar={cerrarSugerencias}
          onSeleccionar={seleccionarSugerencia}
          formRef={mobileBusquedaRef}
        />
      </div>

      <NavbarMenu
        menuAbierto={menuAbierto}
        user={user}
        onCerrarMenu={() => setMenuAbierto(false)}
        onAbrirAuth={() => setAuthModalAbierto(true)}
        onAbrirCarrito={() => setDrawerAbierto(true)}
        onCerrarSesion={() => void cerrarSesion()}
      />

      <AuthModal
        abierto={authModalAbierto}
        onCerrar={() => setAuthModalAbierto(false)}
        onAutenticado={() => setAuthModalAbierto(false)}
      />
      <CartDrawer abierto={drawerAbierto} onCerrar={() => setDrawerAbierto(false)} />
    </header>
  );
}

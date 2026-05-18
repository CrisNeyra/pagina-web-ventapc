"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY = "aurapro.bannerCuotas.visto";
const AUTO_CLOSE_MS = 3000;

export default function WelcomeBannerModal() {
  const { user, loading } = useAuth();
  const [visible, setVisible] = useState(false);
  const ultimoUsuarioRef = useRef<string | null>(null);
  const authInicializadoRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const cerrarModal = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  };

  const abrirModal = () => {
    setVisible(true);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, AUTO_CLOSE_MS);
  };

  useEffect(() => {
    const yaMostrado = window.localStorage.getItem(STORAGE_KEY) === "1";

    if (!yaMostrado) {
      window.localStorage.setItem(STORAGE_KEY, "1");
      window.setTimeout(() => abrirModal(), 0);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    const idActual = user?.uid ?? null;

    if (!authInicializadoRef.current) {
      authInicializadoRef.current = true;
      ultimoUsuarioRef.current = idActual;
      return;
    }

    const idPrevio = ultimoUsuarioRef.current;

    if (idActual && idPrevio === null) {
      window.setTimeout(() => abrirModal(), 0);
    }

    ultimoUsuarioRef.current = idActual;
  }, [loading, user?.uid]);

  useEffect(() => {
    if (!visible) return;

    const manejarEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cerrarModal();
      }
    };

    document.addEventListener("keydown", manejarEscape);
    return () => document.removeEventListener("keydown", manejarEscape);
  }, [visible]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    []
  );

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-4 backdrop-blur-[2px]"
      role="presentation"
    >
      <div className="relative w-full max-w-[820px] overflow-hidden rounded-2xl border border-cyber-purple-500/45 bg-oscuro-900 shadow-[0_0_35px_rgba(109,40,217,0.35)]">
        <button
          type="button"
          onClick={cerrarModal}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/35 p-1.5 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-purple-300"
          aria-label="Cerrar banner de cuotas"
        >
          <FiX size={18} />
        </button>
        <div className="relative aspect-[16/9] w-full">
          <Image
            src="/banners/banner-cuotas.jpg"
            alt="Promoción de cuotas"
            fill
            sizes="(max-width: 768px) 100vw, 820px"
            priority
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

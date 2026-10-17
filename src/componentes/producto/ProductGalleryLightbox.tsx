"use client";

import { useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

interface ProductGalleryLightboxProps {
  abierto: boolean;
  nombre: string;
  imagenes: string[];
  indice: number;
  onCerrar: () => void;
  onIndice: (indice: number) => void;
}

export default function ProductGalleryLightbox({
  abierto,
  nombre,
  imagenes,
  indice,
  onCerrar,
  onIndice,
}: ProductGalleryLightboxProps) {
  const dialogoRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const focoPrevioRef = useRef<HTMLElement | null>(null);

  const anterior = useCallback(() => {
    onIndice((indice - 1 + imagenes.length) % imagenes.length);
  }, [imagenes.length, indice, onIndice]);

  const siguiente = useCallback(() => {
    onIndice((indice + 1) % imagenes.length);
  }, [imagenes.length, indice, onIndice]);

  useEffect(() => {
    if (!abierto) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    focoPrevioRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cerrarRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      focoPrevioRef.current?.focus();
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;

    const focoables = () => {
      const raiz = dialogoRef.current;
      if (!raiz) return [];
      return [
        ...raiz.querySelectorAll<HTMLElement>(
          "button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"
        ),
      ].filter((nodo) => !nodo.hasAttribute("disabled") && nodo.tabIndex !== -1);
    };

    const teclado = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        onCerrar();
        return;
      }
      if (evento.key === "ArrowLeft") anterior();
      if (evento.key === "ArrowRight") siguiente();
      if (evento.key !== "Tab") return;

      const nodos = focoables();
      if (nodos.length === 0) return;
      const primero = nodos[0];
      const ultimo = nodos[nodos.length - 1];
      const activo = document.activeElement;
      const fuera = !(activo instanceof Node) || !dialogoRef.current?.contains(activo);

      if (evento.shiftKey && (activo === primero || fuera)) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && (activo === ultimo || fuera)) {
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", teclado);
    return () => document.removeEventListener("keydown", teclado);
  }, [abierto, anterior, siguiente, onCerrar]);

  if (!abierto) return null;

  const imagen = imagenes[indice] ?? imagenes[0];

  return (
    <div
      ref={dialogoRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Galería ampliada de ${nombre}`}
      onClick={onCerrar}
    >
      <button
        ref={cerrarRef}
        type="button"
        onClick={onCerrar}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400"
        aria-label="Cerrar galería"
      >
        <FiX size={22} />
      </button>

      {imagenes.length > 1 && (
        <>
          <button
            type="button"
            onClick={(evento) => {
              evento.stopPropagation();
              anterior();
            }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400 sm:left-6"
            aria-label="Imagen anterior"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={(evento) => {
              evento.stopPropagation();
              siguiente();
            }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400 sm:right-6"
            aria-label="Imagen siguiente"
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}

      <div
        className="relative flex max-h-[90vh] w-full max-w-[90vw] flex-col items-center gap-4"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="relative h-[min(70vh,720px)] w-full max-w-[min(90vw,960px)]">
          <Image
            src={imagen}
            alt={`${nombre} — foto ${indice + 1}`}
            fill
            sizes="90vw"
            className="object-contain"
          />
        </div>

        {imagenes.length > 1 && (
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {imagenes.map((mini, i) => (
              <button
                key={`${mini}-${i}`}
                type="button"
                onClick={() => onIndice(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === indice ? "true" : undefined}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white/5 ${
                  i === indice ? "border-cyber-cyan-400" : "border-white/20"
                }`}
              >
                <Image src={mini} alt="" fill sizes="56px" className="object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

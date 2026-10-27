"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import ProductGalleryLightbox from "@/componentes/producto/ProductGalleryLightbox";

const PLACEHOLDER = "/placeholder-producto.svg";

interface ProductImageGalleryProps {
  nombre: string;
  imagenes: string[];
}

export default function ProductImageGallery({ nombre, imagenes }: ProductImageGalleryProps) {
  const lista = imagenes.length > 0 ? imagenes : [PLACEHOLDER];
  const [indice, setIndice] = useState(0);
  /** Si falla la carga, guardamos la URL que falló para mostrar placeholder sin effect. */
  const [imagenFallida, setImagenFallida] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);

  const imagenSrc = lista[indice] ?? PLACEHOLDER;
  const imagenActual =
    imagenFallida === imagenSrc && imagenSrc !== PLACEHOLDER ? PLACEHOLDER : imagenSrc;

  const seleccionar = useCallback((nuevo: number) => {
    setIndice(nuevo);
    setImagenFallida(null);
  }, []);

  const cerrarLightbox = useCallback(() => setLightbox(false), []);

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
        <div
          className="order-2 flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:max-h-[520px] lg:w-[72px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0"
          aria-label="Miniaturas del producto"
        >
          {lista.map((imagen, i) => (
            <button
              key={`${imagen}-${i}`}
              type="button"
              onClick={() => seleccionar(i)}
              aria-pressed={indice === i}
              aria-label={`Foto ${i + 1} de ${nombre}`}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-white transition-all sm:h-16 sm:w-16 lg:h-[72px] lg:w-[72px] ${
                indice === i
                  ? "border-cyber-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                  : "border-oscuro-700 hover:border-cyber-cyan-400/50"
              }`}
            >
              <Image
                src={imagen}
                alt=""
                fill
                sizes="72px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>

        <div className="relative order-1 flex-1 overflow-visible lg:order-2">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="relative mx-auto block h-[min(72vw,420px)] w-full max-w-[520px] cursor-zoom-in overflow-hidden rounded-xl border border-oscuro-700 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400 lg:mx-0 lg:h-[520px] lg:max-w-none"
            aria-label={`Ampliar imagen de ${nombre}`}
          >
            <Image
              src={imagenActual}
              alt={nombre}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 520px"
              className="object-contain p-4"
              onError={() => setImagenFallida(imagenSrc)}
            />
          </button>
          <p className="mt-2 text-center text-xs text-muted lg:text-left">Clic para ampliar</p>
        </div>
      </div>

      <ProductGalleryLightbox
        abierto={lightbox}
        nombre={nombre}
        imagenes={lista}
        indice={indice}
        onCerrar={cerrarLightbox}
        onIndice={setIndice}
      />
    </>
  );
}

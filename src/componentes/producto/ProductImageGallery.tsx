"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ProductGalleryLightbox from "@/componentes/producto/ProductGalleryLightbox";

const PLACEHOLDER = "/placeholder-producto.svg";
const ZOOM = 2.2;
const LENTE = 112;

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
  const [zoomActivo, setZoomActivo] = useState(false);
  const [lente, setLente] = useState({ x: 50, y: 50, left: 0, top: 0 });
  const [zoomFinePointer, setZoomFinePointer] = useState(false);
  const visorRef = useRef<HTMLButtonElement>(null);

  const imagenSrc = lista[indice] ?? PLACEHOLDER;
  const imagenActual =
    imagenFallida === imagenSrc && imagenSrc !== PLACEHOLDER ? PLACEHOLDER : imagenSrc;

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const actualizar = () => setZoomFinePointer(mq.matches);
    actualizar();
    mq.addEventListener("change", actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, []);

  const moverZoom = useCallback(
    (clientX: number, clientY: number) => {
      const nodo = visorRef.current;
      if (!nodo || !zoomFinePointer) return;
      const rect = nodo.getBoundingClientRect();
      const px = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const py = Math.max(0, Math.min(clientY - rect.top, rect.height));
      const x = (px / rect.width) * 100;
      const y = (py / rect.height) * 100;
      const mitad = LENTE / 2;
      setLente({
        x,
        y,
        left: Math.max(0, Math.min(px - mitad, rect.width - LENTE)),
        top: Math.max(0, Math.min(py - mitad, rect.height - LENTE)),
      });
    },
    [zoomFinePointer]
  );

  const seleccionar = useCallback((nuevo: number) => {
    setIndice(nuevo);
    setImagenFallida(null);
    setZoomActivo(false);
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
            ref={visorRef}
            type="button"
            onClick={() => setLightbox(true)}
            onMouseEnter={() => zoomFinePointer && setZoomActivo(true)}
            onMouseLeave={() => setZoomActivo(false)}
            onMouseMove={(evento) => {
              if (!zoomActivo && zoomFinePointer) setZoomActivo(true);
              moverZoom(evento.clientX, evento.clientY);
            }}
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

            {zoomActivo && zoomFinePointer && (
              <>
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-0 hidden border-2 border-cyber-cyan-400/80 bg-cyber-cyan-400/10 will-change-transform lg:block"
                  style={{
                    width: LENTE,
                    height: LENTE,
                    transform: `translate(${lente.left}px, ${lente.top}px)`,
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-full top-0 z-20 ml-3 hidden h-[520px] w-[min(420px,calc(50vw-2rem))] overflow-hidden rounded-xl border border-oscuro-700 bg-white shadow-xl xl:block"
                  style={{
                    backgroundImage: `url(${imagenActual})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${ZOOM * 100}%`,
                    backgroundPosition: `${lente.x}% ${lente.y}%`,
                  }}
                />
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-muted lg:text-left">
            {zoomFinePointer
              ? "Pasá el cursor para ampliar · Clic para pantalla completa"
              : "Tocá la imagen para verla en grande"}
          </p>
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

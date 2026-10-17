import { memo } from "react";
import Image from "next/image";
import type { MarcaDestacada } from "@/datos/navegacion";

interface TarjetaMarcaProps {
  marca: MarcaDestacada;
  /** Copia duplicada del marquee: sin foco ni lectores de pantalla. */
  decorativa?: boolean;
}

function TarjetaMarca({ marca, decorativa = false }: TarjetaMarcaProps) {
  return (
    <a
      href={marca.officialUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden={decorativa || undefined}
      tabIndex={decorativa ? -1 : undefined}
      aria-label={
        decorativa ? undefined : `Visitar sitio oficial de ${marca.nombre} (se abre en una pestaña nueva)`
      }
      className="group flex h-24 w-36 shrink-0 items-center justify-center rounded-xl border border-cyber-purple-500/30 bg-white/95 p-3 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-105 hover:border-cyber-cyan-400/70 hover:bg-white hover:shadow-[0_0_22px_rgba(0,122,140,0.35)] focus-visible:-translate-y-1 focus-visible:scale-105 focus-visible:border-cyber-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400"
    >
      <div className="relative h-12 w-24 transition-transform duration-200 group-hover:brightness-110">
        <Image
          src={marca.logo}
          alt=""
          fill
          sizes="96px"
          className="object-contain"
        />
      </div>
    </a>
  );
}

export default memo(TarjetaMarca);

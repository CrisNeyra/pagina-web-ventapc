"use client";

import Image from "next/image";
import Link from "next/link";
import type { Novedad } from "@/tipos/producto";
import { formatearPrecio } from "@/utils/formato";

interface NewsCardProps {
  novedad: Novedad;
}

export default function NewsCard({ novedad }: NewsCardProps) {
  return (
    <article className="rounded-xl border border-cyber-purple-500/30 bg-oscuro-900/75 p-4 transition-all duration-200 hover:border-cyber-pink-400/70 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]">
      <Link href={novedad.enlace} className="block">
        <div className="relative mb-4 h-40 w-full overflow-hidden rounded-xl bg-oscuro-800">
          <Image
            src={novedad.imagen}
            alt={novedad.titulo}
            fill
            sizes="(max-width: 768px) 100vw, 30vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-producto.svg";
            }}
          />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wide text-cyber-pink-400">
          {novedad.categoria}
        </p>
        <h3 className="mt-2 line-clamp-2 min-h-[2.8rem] text-base font-bold text-white">
          {novedad.titulo}
        </h3>
        <p className="mt-3 text-lg font-extrabold text-cyber-cyan-300">
          {formatearPrecio(novedad.precio)}
        </p>
      </Link>
    </article>
  );
}

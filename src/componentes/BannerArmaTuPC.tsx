"use client";

import Image from "next/image";
import Link from "next/link";

// Banner "Armá tu PC" — sección con imagen a la izquierda y texto a la derecha
export default function BannerArmaTuPC() {
  return (
    <section className="mx-4 md:mx-auto max-w-7xl my-10 rounded-2xl overflow-hidden">
      <div className="relative flex flex-col md:flex-row bg-gradient-to-r from-cyber-cyan-500 to-cyber-cyan-300 min-h-[280px] md:min-h-[320px]">
        {/* Imagen */}
        <div className="relative w-full md:w-3/5 h-48 md:h-auto">
          <Image
            src="/banners/banner-arma-tu-pc.jpg"
            alt="Armá tu PC"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Gradiente que funde la imagen hacia el azul */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-cyber-cyan-400" />
          <div className="md:hidden absolute inset-0 bg-gradient-to-b from-transparent to-cyber-cyan-400" />
        </div>

        {/* Contenido */}
        <div className="relative flex flex-col justify-center p-8 md:p-12 md:w-2/5">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Armá tu PC
          </h2>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-6">
            Configurá tu nueva PC sin errores de compatibilidad, seleccionando
            todos los componentes que deseás.
          </p>
          <Link
            href="/arma-tu-pc"
            className="inline-block w-fit border-2 border-white text-white hover:bg-white 
                       hover:text-azul-600 font-semibold px-6 py-2.5 rounded-md text-sm
                       transition-all duration-200"
          >
            Ver más
          </Link>
        </div>
      </div>
    </section>
  );
}

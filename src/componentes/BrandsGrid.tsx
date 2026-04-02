import Image from "next/image";
import { marcas } from "@/datos/navegacion";

export default function BrandsGrid() {
  return (
    <section className="mx-auto my-12 max-w-7xl px-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Marcas destacadas</h2>
        <span className="text-xs uppercase tracking-wider text-cyber-cyan-300/80">Partners oficiales</span>
      </div>

      <div className="rounded-2xl border border-cyber-purple-500/30 bg-oscuro-900/70 p-4 backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
        {marcas.map((marca) => (
          <article
            key={marca.nombre}
            className="flex h-24 items-center justify-center rounded-xl border border-cyber-purple-500/25 bg-oscuro-800/70 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyber-cyan-400/70 hover:shadow-[0_0_18px_rgba(34,211,238,0.2)]"
            aria-label={`Marca ${marca.nombre}`}
          >
            <div className="relative h-12 w-24">
              <Image
                src={marca.logo}
                alt={`Logo de ${marca.nombre}`}
                fill
                sizes="96px"
                className="object-contain"
              />
            </div>
          </article>
        ))}
        </div>
      </div>
    </section>
  );
}

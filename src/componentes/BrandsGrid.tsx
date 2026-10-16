import Image from "next/image";
import { marcas } from "@/datos/navegacion";

function LogoMarca({
  nombre,
  logo,
  decorativa = false,
}: {
  nombre: string;
  logo: string;
  decorativa?: boolean;
}) {
  return (
    <article
      className="flex h-24 w-36 shrink-0 items-center justify-center rounded-xl border border-cyber-purple-500/25 bg-white p-3"
      aria-hidden={decorativa || undefined}
      aria-label={decorativa ? undefined : `Marca ${nombre}`}
    >
      <div className="relative h-12 w-24">
        <Image
          src={logo}
          alt=""
          fill
          sizes="96px"
          className="object-contain"
        />
      </div>
    </article>
  );
}

export default function BrandsGrid() {
  const cinta = [...marcas, ...marcas];

  return (
    <section className="mx-auto my-8 max-w-7xl px-4" aria-label="Marcas destacadas">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Marcas destacadas</h2>
        <span className="text-xs uppercase tracking-wider text-cyber-cyan-300/80">
          Partners oficiales
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-cyber-purple-500/30 bg-oscuro-900/70 p-4 backdrop-blur-sm">
        <div className="marcas-cinta flex w-max gap-4">
          {cinta.map((marca, indice) => (
            <LogoMarca
              key={`${marca.nombre}-${indice}`}
              nombre={indice < marcas.length ? marca.nombre : ""}
              logo={marca.logo}
              decorativa={indice >= marcas.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

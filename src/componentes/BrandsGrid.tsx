import { marcas } from "@/datos/navegacion";
import TarjetaMarca from "@/componentes/marcas/TarjetaMarca";

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
            <TarjetaMarca
              key={`${marca.nombre}-${indice}`}
              marca={marca}
              decorativa={indice >= marcas.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

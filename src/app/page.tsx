import { FiChevronDown } from "react-icons/fi";
import HeroVideos from "@/componentes/HeroVideos";
import BarraBeneficios from "@/componentes/BarraBeneficios";
import BrandsGrid from "@/componentes/BrandsGrid";
import HomeProductos from "@/componentes/HomeProductos";
import BannerArmaTuPC from "@/componentes/BannerArmaTuPC";
import GrillaCategorias from "@/componentes/GrillaCategorias";
import { productosDestacados, productosRebajados } from "@/datos/productos";
import { unificarCatalogo } from "@/utils/productos";

export default function PaginaInicio() {
  const productosUnicos = unificarCatalogo(productosDestacados, productosRebajados);

  return (
    <main className="flex-1 bg-background">
      <section className="relative grid min-h-[calc(100vh-130px)] grid-rows-[minmax(0,1fr)_auto] bg-background">
        <HeroVideos />
        <BarraBeneficios />
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex items-center justify-center">
          <a
            href="#productos-destacados"
            className="pointer-events-auto flex flex-col items-center gap-1 rounded-full border border-cyber-cyan-500/35 bg-oscuro-950/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-cyber-cyan-300 opacity-60 backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:opacity-100 hover:shadow-[0_0_18px_rgba(109,40,217,0.35)]"
          >
            <span>Desliza para explorar</span>
            <FiChevronDown className="animate-bounce text-cyber-cyan-200" size={16} />
          </a>
        </div>
      </section>

      <BrandsGrid />
      <HomeProductos
        productosDestacados={productosDestacados}
        productosUnicos={productosUnicos}
      />
      <BannerArmaTuPC />
      <GrillaCategorias />
    </main>
  );
}

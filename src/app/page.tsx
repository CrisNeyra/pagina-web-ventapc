import HeroVideos from "@/componentes/HeroVideos";
import BarraBeneficios from "@/componentes/BarraBeneficios";
import BannerArmaTuPC from "@/componentes/BannerArmaTuPC";
import GrillaCategorias from "@/componentes/GrillaCategorias";
import ProductCard from "@/componentes/ProductCard";
import NewsCard from "@/componentes/NewsCard";
import BrandsGrid from "@/componentes/BrandsGrid";
import {
  productosDestacados,
  productosRebajados,
  ultimasNovedades,
} from "@/datos/productos";

export default function PaginaInicio() {
  return (
    <main className="flex-1 bg-oscuro-950">
      {/* 1. Hero con videos encadenados + panel promocional */}
      <HeroVideos />

      {/* 2. Barra de beneficios (cuotas, envíos, garantía) */}
      <BarraBeneficios />

      {/* 3. Productos destacados */}
      <section className="mx-auto my-10 max-w-7xl px-4">
        <h2 className="mb-5 text-2xl font-bold text-white">Productos Destacados</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productosDestacados.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      </section>

      {/* 4. Banner "Armá tu PC" */}
      <BannerArmaTuPC />

      {/* 5. Grilla de categorías */}
      <GrillaCategorias />

      {/* 6. Rebajados */}
      <section className="mx-auto my-10 max-w-7xl px-4">
        <h2 className="mb-5 text-2xl font-bold text-white">Precios Rebajados</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productosRebajados.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      </section>

      {/* 7. Últimas novedades */}
      <section className="mx-auto my-10 max-w-7xl px-4">
        <h2 className="mb-5 text-2xl font-bold text-white">Últimas Novedades</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ultimasNovedades.map((novedad) => (
            <NewsCard key={novedad.id} novedad={novedad} />
          ))}
        </div>
      </section>

      {/* 8. Mejores marcas */}
      <BrandsGrid />
    </main>
  );
}

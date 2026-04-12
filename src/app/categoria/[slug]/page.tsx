import Link from "next/link";
import ProductCard from "@/componentes/ProductCard";
import { categorias } from "@/datos/navegacion";
import { catalogoCompleto } from "@/datos/productos";

interface CategoriaPageProps {
  params: Promise<{ slug: string }>;
}

const sinonimosPorSlug: Record<string, string[]> = {
  "pc-escritorio": ["pc de escritorio", "pc armadas", "pc armada", "pc gamer", "combos"],
  "placas-video": ["placas de video", "placa de video", "gpu", "radeon", "rtx"],
  monitores: ["monitor", "monitores", "pantalla", "pantallas"],
  notebooks: ["notebook", "notebooks", "laptop"],
  "memorias-ram": ["memorias ram", "memoria ram", "ram", "ddr4", "ddr5"],
  mothers: ["mother", "mothers", "motherboard"],
  fuentes: ["fuente", "fuentes", "psu"],
  "sillas-gamers": ["silla", "sillas", "sillas gamers"],
  perifericos: ["perifericos", "periféricos", "teclado", "mouse", "auricular"],
  almacenamiento: ["almacenamiento", "ssd", "disco"],
};

function normalizar(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function resolverTituloCategoria(slug: string): string {
  const categoriaNavegacion = categorias.find((item) => item.href === `/categoria/${slug}`);
  if (categoriaNavegacion) return categoriaNavegacion.nombre;

  return slug
    .split("-")
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { slug } = await params;
  const slugNormalizado = normalizar(slug);
  const etiquetas = sinonimosPorSlug[slug] ?? [slugNormalizado.replace(/-/g, " ")];

  const productos = catalogoCompleto.filter((producto) => {
    const categoriaNormalizada = normalizar(producto.categoria);
    return etiquetas.some((etiqueta) => categoriaNormalizada.includes(normalizar(etiqueta)));
  });

  const tituloCategoria = resolverTituloCategoria(slug);

  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-3 text-xs text-cyber-cyan-200/75">
          <Link href="/" className="hover:text-cyber-cyan-100">
            Inicio
          </Link>{" "}
          &gt;{" "}
          <span className="text-cyber-cyan-100/80">
            Categoría
          </span>{" "}
          &gt; <span className="text-cyber-cyan-100">{tituloCategoria}</span>
        </nav>

        <h1 className="mb-6 text-3xl font-black text-white">{tituloCategoria}</h1>

        {productos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-4 text-sm text-cyber-cyan-200/85">
            No hay productos disponibles en esta categoría por el momento.
          </p>
        )}
      </section>
    </main>
  );
}

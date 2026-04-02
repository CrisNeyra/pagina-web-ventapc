import { notFound } from "next/navigation";
import ProductDetailView, { type ProductDetailData } from "@/componentes/ProductDetailView";
import { productosDestacados, productosRebajados, ultimasNovedades } from "@/datos/productos";

interface ProductoPageProps {
  params: Promise<{ id: string }>;
}

function construirProductoDetalle(id: string): ProductDetailData | null {
  const catalogo = [...productosDestacados, ...productosRebajados];
  const productoCatalogo = catalogo.find((p) => p.id === id);

  if (productoCatalogo) {
    const galeria = [
      productoCatalogo.imagen,
      ...catalogo
        .filter((p) => p.categoria === productoCatalogo.categoria && p.id !== productoCatalogo.id)
        .slice(0, 3)
        .map((p) => p.imagen),
    ];

    return {
      ...productoCatalogo,
      sku: `SKU-${productoCatalogo.id.toUpperCase()}`,
      galeria,
    };
  }

  const novedad = ultimasNovedades.find((n) => n.enlace === `/producto/${id}` || n.id === id);
  if (!novedad) return null;

  return {
    id,
    nombre: novedad.titulo,
    descripcion: `Producto destacado en novedades (${novedad.categoria}).`,
    categoria: novedad.categoria,
    precio: novedad.precio,
    imagen: novedad.imagen,
    enStock: true,
    sku: `SKU-${id.toUpperCase()}`,
    galeria: [novedad.imagen, ...catalogo.slice(0, 3).map((p) => p.imagen)],
  };
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { id } = await params;
  const producto = construirProductoDetalle(id);

  if (!producto) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-oscuro-950">
      <ProductDetailView producto={producto} />
    </main>
  );
}

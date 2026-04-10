import { notFound } from "next/navigation";
import ProductDetailView, { type ProductDetailData } from "@/componentes/ProductDetailView";
import { productosDestacados, productosRebajados, ultimasNovedades } from "@/datos/productos";

interface ProductoPageProps {
  params: Promise<{ id: string }>;
}

function crearImagenesDesdeId(id: string): string[] {
  return [
    `/productos/${id}-principal.jpg`,
    `/productos/${id}-img2.jpg`,
    `/productos/${id}-img3.jpg`,
  ];
}

function construirProductoDetalle(id: string): ProductDetailData | null {
  const catalogo = [...productosDestacados, ...productosRebajados];
  const productoCatalogo = catalogo.find((p) => p.id === id);

  if (productoCatalogo) {
    return {
      ...productoCatalogo,
      sku: `SKU-${productoCatalogo.id.toUpperCase()}`,
      imagenes:
        productoCatalogo.imagenes.length > 0
          ? productoCatalogo.imagenes.slice(0, 3)
          : crearImagenesDesdeId(productoCatalogo.id),
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
    enStock: true,
    sku: `SKU-${id.toUpperCase()}`,
    imagenes: crearImagenesDesdeId(id),
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

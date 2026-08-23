import { notFound } from "next/navigation";
import ProductDetailView, { type ProductDetailData } from "@/componentes/ProductDetailView";
import { productosDestacados, productosRebajados, ultimasNovedades } from "@/datos/productos";
import { obtenerProductoDesdeApi, usarCatalogoApi } from "@/servicios/catalogoServicio";

interface ProductoPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 60;

function crearImagenesDesdeId(id: string): string[] {
  return [
    `/productos/${id}-principal.jpg`,
    `/productos/${id}-img2.jpg`,
    `/productos/${id}-img3.jpg`,
  ];
}

function construirProductoDetalleEstatico(id: string): ProductDetailData | null {
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

function jsonLdProducto(producto: ProductDetailData) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion,
    sku: producto.sku,
    image: producto.imagenes[0],
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: producto.precio,
      availability: producto.enStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { id } = await params;

  let producto: ProductDetailData | null = null;

  if (usarCatalogoApi()) {
    const desdeApi = await obtenerProductoDesdeApi(id);
    if (desdeApi) {
      producto = {
        ...desdeApi,
        sku: `SKU-${desdeApi.id.toUpperCase()}`,
        imagenes:
          desdeApi.imagenes.length > 0
            ? desdeApi.imagenes.slice(0, 3)
            : crearImagenesDesdeId(desdeApi.id),
      };
    }
  }

  if (!producto) {
    producto = construirProductoDetalleEstatico(id);
  }

  if (!producto) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-oscuro-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProducto(producto)) }}
      />
      <ProductDetailView producto={producto} />
    </main>
  );
}

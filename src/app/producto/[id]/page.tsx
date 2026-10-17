import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailView, { type ProductDetailData } from "@/componentes/ProductDetailView";
import { catalogoCompleto } from "@/datos/productos";
import { obtenerProductoDesdeApi, usarCatalogoApi } from "@/servicios/catalogoServicio";
import { urlSitio } from "@/lib/site-url";

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
  const productoCatalogo = catalogoCompleto.find((p) => p.id === id);

  if (!productoCatalogo) return null;

  return {
    ...productoCatalogo,
    sku: `SKU-${productoCatalogo.id.toUpperCase()}`,
    specs: productoCatalogo.specs ?? null,
    imagenes:
      productoCatalogo.imagenes.length > 0
        ? productoCatalogo.imagenes
        : crearImagenesDesdeId(productoCatalogo.id),
  };
}

function jsonLdProducto(producto: ProductDetailData) {
  const base = urlSitio();
  const imagen = producto.imagenes[0];
  const imagenAbsoluta = imagen?.startsWith("http") ? imagen : `${base}${imagen ?? "/logo.jpg"}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion,
    sku: producto.sku,
    image: imagenAbsoluta,
    offers: {
      "@type": "Offer",
      url: `${base}/producto/${producto.id}`,
      priceCurrency: "ARS",
      price: producto.precio,
      availability: producto.enStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

async function cargarProducto(id: string): Promise<ProductDetailData | null> {
  if (usarCatalogoApi()) {
    const desdeApi = await obtenerProductoDesdeApi(id);
    if (desdeApi) {
      return {
        ...desdeApi,
        sku: `SKU-${desdeApi.id.toUpperCase()}`,
        specs: desdeApi.specs ?? null,
        imagenes:
          desdeApi.imagenes.length > 0
            ? desdeApi.imagenes
            : crearImagenesDesdeId(desdeApi.id),
      };
    }
  }
  return construirProductoDetalleEstatico(id);
}

export async function generateMetadata({ params }: ProductoPageProps): Promise<Metadata> {
  const { id } = await params;
  const producto = await cargarProducto(id);
  if (!producto) return { title: "Producto no encontrado" };
  const descripcion = producto.descripcion.slice(0, 160);
  return {
    title: producto.nombre,
    description: descripcion,
    openGraph: {
      title: producto.nombre,
      description: descripcion,
      type: "website",
      images: producto.imagenes[0] ? [{ url: producto.imagenes[0] }] : undefined,
    },
    alternates: { canonical: `${urlSitio()}/producto/${producto.id}` },
  };
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { id } = await params;
  const producto = await cargarProducto(id);

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

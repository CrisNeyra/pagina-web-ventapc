import type { Producto } from "@/tipos/producto";
import type { Prisma } from "@prisma/client";
import { catalogoCompleto } from "@/datos/productos";
import { apiConfigurada, apiFetch, usaApiExterna } from "@/lib/api-client";
import { databaseUrlConfigurada, prisma } from "@/lib/prisma";
import { mapearProductoDb } from "@/lib/mapear-producto";

interface ProductoApi {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  enStock: boolean;
  categoria: string;
  imagenes: string[];
  etiqueta?: string | null;
}

function mapearProducto(producto: ProductoApi): Producto {
  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    imagenes: Array.isArray(producto.imagenes) ? producto.imagenes : [],
    categoria: producto.categoria,
    enStock: producto.enStock,
    stock: producto.stock,
    etiqueta: producto.etiqueta ?? undefined,
  };
}

/** Catálogo desde DB (Neon/Prisma) o API externa; fallback estático. */
export function usarCatalogoApi(): boolean {
  if (databaseUrlConfigurada()) return true;
  return process.env.NEXT_PUBLIC_USE_API_CATALOG === "true" && usaApiExterna();
}

async function obtenerCatalogoDesdePrisma(opciones?: {
  categoria?: string;
  busqueda?: string;
  soloStock?: boolean;
}): Promise<Producto[]> {
  const where: Prisma.ProductWhereInput = {};
  if (opciones?.categoria) where.categoria = opciones.categoria;
  if (opciones?.soloStock) where.enStock = true;
  if (opciones?.busqueda) {
    where.OR = [
      { nombre: { contains: opciones.busqueda, mode: "insensitive" } },
      { descripcion: { contains: opciones.busqueda, mode: "insensitive" } },
    ];
  }

  const productos = await prisma.product.findMany({
    where,
    orderBy: { nombre: "asc" },
  });
  return productos.map(mapearProductoDb);
}

export async function obtenerCatalogoDesdeApi(opciones?: {
  categoria?: string;
  busqueda?: string;
  soloStock?: boolean;
}): Promise<Producto[]> {
  if (databaseUrlConfigurada() && !usaApiExterna()) {
    return obtenerCatalogoDesdePrisma(opciones);
  }

  const params = new URLSearchParams();
  if (opciones?.categoria) params.set("categoria", opciones.categoria);
  if (opciones?.busqueda) params.set("busqueda", opciones.busqueda);
  if (opciones?.soloStock) params.set("soloStock", "true");

  const query = params.toString();
  const datos = await apiFetch<{ productos: ProductoApi[] }>(
    `/products${query ? `?${query}` : ""}`,
    { next: { revalidate: 60 } }
  );

  return datos.productos.map(mapearProducto);
}

export async function obtenerProductoDesdeApi(id: string): Promise<Producto | null> {
  try {
    if (databaseUrlConfigurada() && !usaApiExterna()) {
      const producto =
        (await prisma.product.findUnique({ where: { id } })) ??
        (await prisma.product.findUnique({ where: { slug: id } }));
      return producto ? mapearProductoDb(producto) : null;
    }

    const producto = await apiFetch<ProductoApi>(`/products/${id}`, {
      next: { revalidate: 60 },
    });
    return mapearProducto(producto);
  } catch {
    return null;
  }
}

export function obtenerCatalogoEstatico(): Producto[] {
  return catalogoCompleto;
}

export async function obtenerCatalogo(opciones?: {
  categoria?: string;
  busqueda?: string;
  soloStock?: boolean;
}): Promise<Producto[]> {
  if (usarCatalogoApi()) {
    try {
      return await obtenerCatalogoDesdeApi(opciones);
    } catch {
      return obtenerCatalogoEstatico();
    }
  }
  return obtenerCatalogoEstatico();
}

export async function verificarStockProducto(id: string, cantidad: number): Promise<boolean> {
  if (!usarCatalogoApi()) return true;
  try {
    const producto = await obtenerProductoDesdeApi(id);
    if (!producto) return true;
    if (!producto.enStock) return false;
    if (typeof producto.stock === "number") return producto.stock >= cantidad;
    return true;
  } catch {
    return true;
  }
}

export { apiConfigurada };

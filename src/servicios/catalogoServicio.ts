import type { Producto } from "@/tipos/producto";
import { catalogoCompleto } from "@/datos/productos";
import { apiConfigurada, apiFetch } from "@/lib/api-client";

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

export function usarCatalogoApi(): boolean {
  return process.env.NEXT_PUBLIC_USE_API_CATALOG === "true" && apiConfigurada();
}

export async function obtenerCatalogoDesdeApi(opciones?: {
  categoria?: string;
  busqueda?: string;
  soloStock?: boolean;
}): Promise<Producto[]> {
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
    if (!producto?.enStock) return false;
    if (typeof producto.stock === "number") return producto.stock >= cantidad;
    return true;
  } catch {
    return true;
  }
}

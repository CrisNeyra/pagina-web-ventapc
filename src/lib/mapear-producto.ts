import type { Product } from "@prisma/client";
import type { Producto } from "@/tipos/producto";

export function mapearProductoDb(producto: Product): Producto {
  const imagenes = Array.isArray(producto.imagenes)
    ? (producto.imagenes as string[])
    : [];

  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    imagenes,
    categoria: producto.categoria,
    enStock: producto.enStock,
    stock: producto.stock,
    etiqueta: producto.etiqueta ?? undefined,
  };
}

export function mapearProductoApi(producto: Product) {
  return {
    id: producto.id,
    slug: producto.slug,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    stock: producto.stock,
    enStock: producto.enStock,
    categoria: producto.categoria,
    imagenes: Array.isArray(producto.imagenes) ? producto.imagenes : [],
    etiqueta: producto.etiqueta,
  };
}

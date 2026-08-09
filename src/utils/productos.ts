import type { Producto } from "@/tipos/producto";

export function unificarCatalogo(...listas: Producto[][]): Producto[] {
  const mapa = new Map<string, Producto>();
  listas.flat().forEach((producto) => {
    if (!mapa.has(producto.id)) {
      mapa.set(producto.id, producto);
    }
  });
  return Array.from(mapa.values());
}

export function filtrarProductosPorNombre(
  productos: Producto[],
  termino: string
): Producto[] {
  const normalizado = termino.trim().toLowerCase();
  if (!normalizado) return productos;
  return productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(normalizado)
  );
}

export function filtrarProductosNotebooks(productos: Producto[]): Producto[] {
  return productos.filter((producto) =>
    producto.categoria.toLowerCase().includes("notebook")
  );
}

export function mezclarProductos<T>(productos: T[]): T[] {
  const copia = [...productos];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

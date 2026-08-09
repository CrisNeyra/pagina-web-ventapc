import { catalogoCompleto } from "./productos";

export const preciosCatalogo: Record<string, number> = Object.fromEntries(
  catalogoCompleto.map((producto) => [producto.id, producto.precio])
);

import type {
  BuilderCategory,
  BuilderCategoryId,
  BuilderProduct,
} from "@/tipos/pcBuilder";
import { catalogoCompleto } from "@/datos/productos";
import type { Producto } from "@/tipos/producto";

const IDS_POR_CATEGORIA: { id: string; categoria: BuilderCategoryId }[] = [
  { id: "proc-001", categoria: "procesador" },
  { id: "proc-002", categoria: "procesador" },
  { id: "proc-003", categoria: "procesador" },
  { id: "proc-004", categoria: "procesador" },
  { id: "mother-001", categoria: "motherboard" },
  { id: "mother-002", categoria: "motherboard" },
  { id: "mother-003", categoria: "motherboard" },
  { id: "cooler-001", categoria: "cooler" },
  { id: "cooler-002", categoria: "cooler" },
  { id: "ram-001", categoria: "ram" },
  { id: "ram-002", categoria: "ram" },
  { id: "ram-003", categoria: "ram" },
  { id: "ram-004", categoria: "ram" },
  { id: "gpu-001", categoria: "gpu" },
  { id: "gpu-002", categoria: "gpu" },
  { id: "gpu-003", categoria: "gpu" },
  { id: "ssd-001", categoria: "almacenamiento" },
  { id: "ssd-002", categoria: "almacenamiento" },
  { id: "ssd-003", categoria: "almacenamiento" },
  { id: "ssd-004", categoria: "almacenamiento" },
  { id: "fuente-001", categoria: "fuente" },
  { id: "fuente-002", categoria: "fuente" },
  { id: "fuente-003", categoria: "fuente" },
  { id: "combo-001", categoria: "gabinete" },
];

function armarProducto(
  catalogo: Producto[],
  id: string,
  categoria: BuilderCategoryId
): BuilderProduct | null {
  const producto = catalogo.find((item) => item.id === id);
  if (!producto) return null;
  return {
    id: producto.id,
    categoria,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    imagen: producto.imagenes[0] ?? "/placeholder-producto.svg",
    stock: producto.enStock,
    specs: producto.specs ?? undefined,
  };
}

export function productosBuilderDesdeCatalogo(catalogo: Producto[]): BuilderProduct[] {
  const fuente = catalogo.length > 0 ? catalogo : catalogoCompleto;
  return IDS_POR_CATEGORIA.flatMap((item) => {
    const producto = armarProducto(fuente, item.id, item.categoria) ?? armarProducto(catalogoCompleto, item.id, item.categoria);
    return producto ? [producto] : [];
  });
}

export const builderCategories: BuilderCategory[] = [
  { id: "procesador", nombre: "Procesador", icono: "CPU" },
  { id: "motherboard", nombre: "Motherboard", icono: "MB" },
  { id: "cooler", nombre: "Cooler", icono: "CL" },
  { id: "ram", nombre: "Memoria RAM", icono: "RAM" },
  { id: "gpu", nombre: "Placa de Video", icono: "GPU" },
  { id: "almacenamiento", nombre: "Almacenamiento", icono: "SSD" },
  { id: "fuente", nombre: "Fuente", icono: "PSU" },
  { id: "gabinete", nombre: "Gabinete", icono: "CASE" },
];

export const builderProducts: BuilderProduct[] = productosBuilderDesdeCatalogo(catalogoCompleto);

export const defaultBuilderCategory: BuilderCategoryId = "procesador";

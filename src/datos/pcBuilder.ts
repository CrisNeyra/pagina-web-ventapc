import type {
  BuilderCategory,
  BuilderCategoryId,
  BuilderProduct,
} from "@/tipos/pcBuilder";
import { productosDestacados, productosRebajados } from "@/datos/productos";

// Imágenes del PC Builder reutilizan assets del catálogo principal.
const catalogoBase = [...productosDestacados, ...productosRebajados];

function obtenerProductoPorId(id: string) {
  const producto = catalogoBase.find((item) => item.id === id);
  if (!producto) {
    throw new Error(`No se encontró el producto "${id}" para Pc Builder.`);
  }
  return producto;
}

function crearBuilderProduct(
  id: string,
  categoria: BuilderCategoryId,
  productoId: string,
  imagenOverride?: string
): BuilderProduct {
  const producto = obtenerProductoPorId(productoId);
  return {
    id,
    categoria,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    imagen: imagenOverride ?? producto.imagenes[0] ?? "/placeholder-producto.svg",
    stock: producto.enStock,
  };
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

export const builderProducts: BuilderProduct[] = [
  crearBuilderProduct("b-cpu-001", "procesador", "proc-001"),
  crearBuilderProduct("b-cpu-002", "procesador", "proc-002"),
  crearBuilderProduct("b-cpu-003", "procesador", "proc-003"),
  crearBuilderProduct("b-cpu-004", "procesador", "proc-004"),

  // Motherboards — imágenes del catálogo de PCs armadas.
  crearBuilderProduct("b-mb-001", "motherboard", "pc-001", "/productos/pc-001-principal.jpg"),
  crearBuilderProduct("b-mb-002", "motherboard", "pc-002", "/productos/pc-002-principal.jpg"),

  // Coolers — imágenes de combos/PCs del catálogo.
  crearBuilderProduct("b-cl-001", "cooler", "combo-001", "/productos/combo-001-principal.jpg"),
  crearBuilderProduct("b-cl-002", "cooler", "pc-003", "/productos/pc-003-principal.jpg"),

  crearBuilderProduct("b-ram-001", "ram", "ram-001"),
  crearBuilderProduct("b-ram-002", "ram", "ram-002"),
  crearBuilderProduct("b-ram-003", "ram", "ram-003"),

  crearBuilderProduct("b-gpu-001", "gpu", "gpu-001"),
  crearBuilderProduct("b-gpu-002", "gpu", "gpu-002"),
  crearBuilderProduct("b-gpu-003", "gpu", "gpu-003"),

  crearBuilderProduct("b-ssd-001", "almacenamiento", "ssd-001"),
  crearBuilderProduct("b-ssd-002", "almacenamiento", "ssd-002"),
  crearBuilderProduct("b-ssd-003", "almacenamiento", "ssd-003"),
  crearBuilderProduct("b-ssd-004", "almacenamiento", "ssd-004"),

  // Fuentes — imágenes de PCs del catálogo.
  crearBuilderProduct("b-psu-001", "fuente", "pc-002", "/productos/pc-002-principal.jpg"),
  crearBuilderProduct("b-psu-002", "fuente", "combo-001", "/productos/combo-001-principal.jpg"),

  // Gabinetes — imágenes de combos/PCs del catálogo.
  crearBuilderProduct("b-case-001", "gabinete", "combo-001", "/productos/combo-001-principal.jpg"),
  crearBuilderProduct("b-case-002", "gabinete", "pc-001", "/productos/pc-001-principal.jpg"),
];

export const defaultBuilderCategory: BuilderCategoryId = "procesador";

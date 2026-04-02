export type BuilderCategoryId =
  | "procesador"
  | "motherboard"
  | "cooler"
  | "ram"
  | "gpu"
  | "almacenamiento"
  | "fuente"
  | "gabinete";

export interface BuilderCategory {
  id: BuilderCategoryId;
  nombre: string;
  icono: string;
}

export interface BuilderProduct {
  id: string;
  categoria: BuilderCategoryId;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  stock: boolean;
}

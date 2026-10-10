export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioAnterior?: number;
  imagenes: string[];
  categoria: string;
  enStock: boolean;
  stock?: number;
  etiqueta?: string; // "PC ARMADA", "COMBO", etc.
  specs?: import("@/datos/especificacionesPc").EspecificacionPc | null;
}

export interface Banner {
  id: string;
  imagen: string;
  titulo: string;
  subtitulo: string;
  enlace: string;
}

export interface Novedad {
  id: string;
  categoria: string;
  titulo: string;
  precio: number;
  imagen: string;
  enlace: string;
}

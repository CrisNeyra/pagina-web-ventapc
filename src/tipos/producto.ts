export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioAnterior?: number;
  imagen: string;
  categoria: string;
  enStock: boolean;
  etiqueta?: string; // "PC ARMADA", "COMBO", etc.
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

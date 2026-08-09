export type MetodoPago =
  | "efectivo"
  | "transferencia"
  | "debito"
  | "credito";

export interface MetodoPagoOpcion {
  id: MetodoPago;
  titulo: string;
  descripcion: string;
  badge?: string;
}

export const METODOS_PAGO: MetodoPagoOpcion[] = [
  {
    id: "efectivo",
    titulo: "Efectivo en el local",
    descripcion: "Abonás al retirar tu pedido en nuestro showroom.",
  },
  {
    id: "transferencia",
    titulo: "Transferencia bancaria",
    descripcion: "10% de descuento abonando por transferencia.",
    badge: "-10%",
  },
  {
    id: "debito",
    titulo: "Tarjeta de débito",
    descripcion: "Pago inmediato con tarjeta de débito.",
  },
  {
    id: "credito",
    titulo: "Tarjeta de crédito",
    descripcion: "Hasta 12 cuotas sin interés.",
    badge: "12 cuotas",
  },
];

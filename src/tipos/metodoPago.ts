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
    descripcion: "Pago seguro con Mercado Pago (débito).",
  },
  {
    id: "credito",
    titulo: "Tarjeta de crédito",
    descripcion: "Mercado Pago: cuotas según el emisor.",
    badge: "Mercado Pago",
  },
];

export function metodosPagoVisibles(pagosOnlineActivos: boolean): MetodoPagoOpcion[] {
  if (pagosOnlineActivos) return METODOS_PAGO;
  return METODOS_PAGO.filter((metodo) => metodo.id !== "debito" && metodo.id !== "credito");
}

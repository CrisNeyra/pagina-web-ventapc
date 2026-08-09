import type { MetodoPago } from "@/tipos/metodoPago";

export const DESCUENTO_TRANSFERENCIA = 0.1;
export const CUOTAS_MAXIMAS = 12;

export interface ItemCheckout {
  precio: number;
  cantidad: number;
}

export function calcularSubtotal(items: ItemCheckout[]): number {
  return items.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

export function calcularDescuentoTransferencia(subtotal: number): number {
  return Math.round(subtotal * DESCUENTO_TRANSFERENCIA);
}

export function calcularTotalCheckout(
  items: ItemCheckout[],
  metodoPago: MetodoPago
): number {
  const subtotal = calcularSubtotal(items);
  if (metodoPago === "transferencia") {
    return subtotal - calcularDescuentoTransferencia(subtotal);
  }
  return subtotal;
}

export function calcularCuota(total: number, cuotas: number): number {
  if (cuotas <= 0) return total;
  return Math.round(total / cuotas);
}

export function estadoPedidoPorMetodo(metodoPago: MetodoPago): string {
  switch (metodoPago) {
    case "efectivo":
      return "pending_cash";
    case "transferencia":
      return "pending_transfer";
    default:
      return "pending_payment";
  }
}

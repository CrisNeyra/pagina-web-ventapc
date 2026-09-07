import { apiConfigurada } from "@/lib/api-client";
import { obtenerApiToken } from "@/lib/api-token";
import { obtenerPedidosUsuarioApi } from "@/servicios/apiBackendServicio";

export interface ItemPedido {
  id: string;
  precio: number;
  cantidad?: number;
  nombre?: string;
}

export interface Pedido {
  id: string;
  estado: string;
  amount: number;
  currency: string;
  items: ItemPedido[];
  metodoPago?: string;
  paymentIntentId?: string;
  cuotas?: number | null;
  createdAt: Date | null;
}

const ETIQUETAS_METODO_PAGO: Record<string, string> = {
  efectivo: "Efectivo en el local",
  transferencia: "Transferencia bancaria",
  debito: "Tarjeta de débito",
  credito: "Tarjeta de crédito",
};

export function etiquetaMetodoPago(metodo?: string): string {
  if (!metodo) return "—";
  return ETIQUETAS_METODO_PAGO[metodo] ?? metodo;
}

/** Stripe guarda centavos; pedidos offline guardan pesos. */
export function montoPedidoEnPesos(pedido: Pick<Pedido, "amount" | "paymentIntentId">): number {
  if (pedido.paymentIntentId) {
    return Math.round(pedido.amount / 100);
  }
  return pedido.amount;
}

const ETIQUETAS_ESTADO: Record<string, string> = {
  pending_payment: "Pendiente de pago",
  pending_cash: "Pendiente de pago en local",
  pending_transfer: "Pendiente de transferencia",
  paid: "Pagado",
  payment_failed: "Pago fallido",
};

export function etiquetaEstadoPedido(estado: string): string {
  return ETIQUETAS_ESTADO[estado] ?? estado;
}

export async function obtenerPedidosUsuario(_userId: string): Promise<Pedido[]> {
  if (!apiConfigurada()) return [];

  const token = obtenerApiToken();
  if (!token) return [];

  try {
    const pedidos = await obtenerPedidosUsuarioApi(token);
    return pedidos.map((pedido) => ({
      id: pedido.id,
      estado: pedido.estado,
      amount: pedido.totalPesos,
      currency: "ars",
      items: pedido.items.map((item) => ({
        id: item.nombre,
        precio: item.precioUnitario,
        cantidad: item.cantidad,
        nombre: item.nombre,
      })),
      metodoPago: pedido.metodoPago ?? undefined,
      createdAt: pedido.createdAt ? new Date(pedido.createdAt) : null,
    }));
  } catch {
    return [];
  }
}

import { apiConfigurada } from "@/lib/api-client";
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
  debito: "Mercado Pago · débito",
  credito: "Mercado Pago · crédito",
};

export function etiquetaMetodoPago(metodo?: string): string {
  if (!metodo) return "—";
  return ETIQUETAS_METODO_PAGO[metodo] ?? metodo;
}

/** Los pedidos de Next/Prisma guardan el total en pesos. */
export function montoPedidoEnPesos(pedido: Pick<Pedido, "amount" | "paymentIntentId">): number {
  return pedido.amount;
}

const ETIQUETAS_ESTADO: Record<string, string> = {
  pending_payment: "Pendiente de pago (Mercado Pago)",
  pending_cash: "Pendiente de pago en local",
  pending_transfer: "Pendiente de transferencia",
  paid: "Pagado",
  payment_failed: "Pago fallido",
  ready_for_pickup: "Listo para retiro",
  shipped: "Enviado",
  cancelled: "Cancelado",
};

export function etiquetaEstadoPedido(estado: string): string {
  return ETIQUETAS_ESTADO[estado] ?? estado;
}

export async function obtenerPedidosUsuario(userId: string): Promise<Pedido[]> {
  void userId;
  if (!apiConfigurada()) return [];

  try {
    const pedidos = await obtenerPedidosUsuarioApi("");
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

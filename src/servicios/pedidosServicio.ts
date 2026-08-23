import {
  collection,
  getDocs,
  query,
  where,
  type Timestamp,
} from "firebase/firestore";
import { obtenerFirestoreDb } from "@/configuracion/firebase";
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

function convertirFecha(valor: unknown): Date | null {
  if (!valor) return null;
  if (typeof valor === "object" && valor !== null && "toDate" in valor) {
    return (valor as Timestamp).toDate();
  }
  return null;
}

export async function obtenerPedidosUsuario(userId: string): Promise<Pedido[]> {
  if (apiConfigurada()) {
    const token = obtenerApiToken();
    if (token) {
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
  }

  const db = obtenerFirestoreDb();
  if (!db) return [];

  const consulta = query(collection(db, "pedidos"), where("uid", "==", userId));
  const snapshot = await getDocs(consulta);

  const pedidos = snapshot.docs.map((doc) => {
    const datos = doc.data();
    return {
      id: doc.id,
      estado: String(datos.estado ?? "pending_payment"),
      amount: Number(datos.amount ?? 0),
      currency: String(datos.currency ?? "ars"),
      items: Array.isArray(datos.items) ? datos.items : [],
      metodoPago: datos.metodoPago ? String(datos.metodoPago) : undefined,
      paymentIntentId: datos.paymentIntentId ? String(datos.paymentIntentId) : undefined,
      cuotas: datos.cuotas != null ? Number(datos.cuotas) : null,
      createdAt: convertirFecha(datos.createdAt),
    };
  });

  return pedidos.sort((a, b) => {
    const fechaA = a.createdAt?.getTime() ?? 0;
    const fechaB = b.createdAt?.getTime() ?? 0;
    return fechaB - fechaA;
  });
}

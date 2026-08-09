import {
  collection,
  getDocs,
  query,
  where,
  type Timestamp,
} from "firebase/firestore";
import { obtenerFirestoreDb } from "@/configuracion/firebase";

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
  createdAt: Date | null;
}

const ETIQUETAS_ESTADO: Record<string, string> = {
  pending_payment: "Pendiente de pago",
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
      createdAt: convertirFecha(datos.createdAt),
    };
  });

  return pedidos.sort((a, b) => {
    const fechaA = a.createdAt?.getTime() ?? 0;
    const fechaB = b.createdAt?.getTime() ?? 0;
    return fechaB - fechaA;
  });
}

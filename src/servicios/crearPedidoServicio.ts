import type { MetodoPago } from "@/tipos/metodoPago";
import type { DatosEntrega } from "@/lib/entrega";
import { pedidosApiConfigurados, crearPedidoEnApi } from "@/servicios/apiBackendServicio";
import { obtenerApiToken } from "@/lib/api-token";

export interface ItemPedidoRequest {
  id: string;
  precio: number;
  cantidad: number;
  nombre?: string;
}

export interface ResultadoCrearPedido {
  ok: true;
  orderId: string;
  total: number;
  metodoPago: MetodoPago;
}

export interface ErrorCrearPedido {
  ok: false;
  mensaje: string;
}

export type RespuestaCrearPedido = ResultadoCrearPedido | ErrorCrearPedido;

export async function crearPedidoOffline(
  items: ItemPedidoRequest[],
  metodoPago: MetodoPago,
  _idToken: string,
  entrega: DatosEntrega
): Promise<RespuestaCrearPedido> {
  try {
    if (!pedidosApiConfigurados()) {
      return {
        ok: false,
        mensaje: "Pedidos requieren NEXT_PUBLIC_API_URL (API Nest).",
      };
    }

    const apiToken = obtenerApiToken();
    if (!apiToken) {
      return { ok: false, mensaje: "Debés iniciar sesión para confirmar el pedido." };
    }

    const pedido = await crearPedidoEnApi(items, metodoPago, entrega, apiToken);
    return {
      ok: true,
      orderId: pedido.id,
      total: pedido.totalPesos,
      metodoPago: pedido.metodoPago as MetodoPago,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("SIN_STOCK")) {
      return { ok: false, mensaje: "Alguno de los productos no tiene stock suficiente." };
    }
    if (msg.includes("PRICE_MISMATCH")) {
      return {
        ok: false,
        mensaje: "Los precios del carrito no coinciden. Actualizá la página e intentá de nuevo.",
      };
    }
    if (msg.includes("UNKNOWN_PRODUCT")) {
      return { ok: false, mensaje: "Un producto del carrito ya no está en el catálogo." };
    }
    if (msg.includes("RATE_LIMITED")) {
      return { ok: false, mensaje: "Demasiados intentos. Esperá un minuto e intentá de nuevo." };
    }
    if (msg.includes("API no respondió") || msg.includes("No se pudo conectar")) {
      return { ok: false, mensaje: msg };
    }
    return {
      ok: false,
      mensaje: msg || "No se pudo crear el pedido. Intentá nuevamente.",
    };
  }
}

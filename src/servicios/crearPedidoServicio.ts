import type { MetodoPago } from "@/tipos/metodoPago";

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

function mapearError(error?: string): string {
  switch (error) {
    case "UNAUTHORIZED":
      return "Debés iniciar sesión para confirmar el pedido.";
    case "METODO_PAGO_INVALIDO":
      return "El método de pago seleccionado no es válido.";
    case "UNKNOWN_PRODUCT":
      return "Uno de los productos del carrito no existe en el catálogo.";
    case "PRICE_MISMATCH":
      return "Los precios del carrito no coinciden con el catálogo. Actualizá la página.";
    case "PEDIDOS_NO_CONFIGURADOS":
      return "Los pedidos no están configurados en el servidor. Contactá soporte.";
    default:
      return "No se pudo crear el pedido. Intentá nuevamente.";
  }
}

export async function crearPedidoOffline(
  items: ItemPedidoRequest[],
  metodoPago: MetodoPago,
  idToken: string
): Promise<RespuestaCrearPedido> {
  try {
    const respuesta = await fetch("/api/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ items, metodoPago }),
    });

    const datos = (await respuesta.json().catch(() => ({}))) as {
      error?: string;
      orderId?: string;
      total?: number;
      metodoPago?: MetodoPago;
    };

    if (!respuesta.ok) {
      return { ok: false, mensaje: mapearError(datos.error) };
    }

    if (!datos.orderId || datos.total === undefined || !datos.metodoPago) {
      return { ok: false, mensaje: "Respuesta inválida del servidor." };
    }

    return {
      ok: true,
      orderId: datos.orderId,
      total: datos.total,
      metodoPago: datos.metodoPago,
    };
  } catch {
    return { ok: false, mensaje: "Error de red al crear el pedido." };
  }
}

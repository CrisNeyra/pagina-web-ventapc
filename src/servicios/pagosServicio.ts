import { obtenerUrlPaymentIntent } from "@/configuracion/stripe";
import { preciosCatalogo } from "@/datos/preciosCatalogo";
import { validarItemsContraCatalogo } from "@/lib/validarItemsPago";
import type { DatosEntrega } from "@/lib/entrega";

export interface ItemPago {
  id: string;
  precio: number;
  cantidad: number;
}

export interface ResultadoPaymentIntent {
  ok: true;
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
}

export interface ErrorPaymentIntent {
  ok: false;
  mensaje: string;
}

export type RespuestaPaymentIntent = ResultadoPaymentIntent | ErrorPaymentIntent;

function mapearErrorHttp(status: number, error?: string): string {
  switch (error) {
    case "UNAUTHORIZED":
      return "Tu sesión expiró. Volvé a iniciar sesión.";
    case "INVALID_ITEMS":
      return "El carrito contiene productos inválidos.";
    case "INVALID_AMOUNT":
      return "El monto total del pedido no es válido.";
    case "UNKNOWN_PRODUCT":
      return "Uno de los productos del carrito no existe en el catálogo.";
    case "PRICE_MISMATCH":
      return "Los precios del carrito no coinciden con el catálogo. Actualizá la página.";
    case "RATE_LIMITED":
      return "Demasiados intentos de pago. Esperá un minuto e intentá de nuevo.";
    case "METHOD_NOT_ALLOWED":
      return "Método de solicitud no permitido.";
    default:
      if (status === 401) return "Debés iniciar sesión para pagar.";
      if (status >= 500) return "El servidor de pagos no está disponible. Intentá más tarde.";
      return "No se pudo iniciar el pago. Revisá tu conexión e intentá de nuevo.";
  }
}

export interface OpcionesPaymentIntent {
  metodoPago?: "debito" | "credito";
  cuotas?: number;
  entrega?: DatosEntrega;
}

export async function crearPaymentIntent(
  items: ItemPago[],
  idToken: string,
  opciones: OpcionesPaymentIntent = {}
): Promise<RespuestaPaymentIntent> {
  const url = obtenerUrlPaymentIntent();
  if (!url) {
    return {
      ok: false,
      mensaje:
        "Pagos no configurados. Agregá NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY y la URL de la Cloud Function.",
    };
  }

  if (items.length === 0) {
    return { ok: false, mensaje: "El carrito está vacío." };
  }

  const validacionCatalogo = validarItemsContraCatalogo(items, preciosCatalogo);
  if (!validacionCatalogo.ok) {
    return {
      ok: false,
      mensaje: mapearErrorHttp(400, validacionCatalogo.error),
    };
  }

  try {
    const cuotas =
      opciones.metodoPago === "credito"
        ? Math.min(12, Math.max(1, opciones.cuotas ?? 1))
        : 1;

    const respuesta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        items,
        currency: "ars",
        metodoPago: opciones.metodoPago ?? "debito",
        cuotas,
        entrega: opciones.entrega ?? { tipo: "retiro" },
        metadata: {
          metodoPago: opciones.metodoPago ?? "debito",
          cuotas: String(cuotas),
        },
      }),
    });

    const datos = (await respuesta.json().catch(() => ({}))) as {
      error?: string;
      orderId?: string;
      paymentIntentId?: string;
      clientSecret?: string;
    };

    if (!respuesta.ok) {
      return {
        ok: false,
        mensaje: mapearErrorHttp(respuesta.status, datos.error),
      };
    }

    if (!datos.clientSecret || !datos.orderId || !datos.paymentIntentId) {
      return { ok: false, mensaje: "Respuesta inválida del servidor de pagos." };
    }

    return {
      ok: true,
      orderId: datos.orderId,
      paymentIntentId: datos.paymentIntentId,
      clientSecret: datos.clientSecret,
    };
  } catch {
    return {
      ok: false,
      mensaje: "Error de red al conectar con el servidor de pagos.",
    };
  }
}

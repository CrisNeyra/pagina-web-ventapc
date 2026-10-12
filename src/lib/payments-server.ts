import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cotizarEnvioPorCp } from "@/lib/shipping-server";
import { notificarPedidoCreado } from "@/lib/email-server";
import {
  EntregaDto,
  ItemPedidoDto,
  OrderError,
  reservarStock,
  restaurarStock,
} from "@/lib/orders-server";
import { urlRetornoMercadoPago } from "@/lib/site-url";

const MP_API = "https://api.mercadopago.com";

function accessTokenMp(): string {
  const key = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!key) throw new OrderError("MERCADOPAGO_NO_CONFIGURADO");
  return key;
}

export function mercadoPagoSecretConfigurado(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN?.trim());
}

function validarEntrega(entrega: EntregaDto) {
  if (entrega.tipo === "retiro") return;
  const envio = entrega.envio;
  if (
    !envio?.direccion?.trim() ||
    !envio?.ciudad?.trim() ||
    !envio?.codigoPostal?.trim() ||
    !envio?.telefonoContacto?.trim()
  ) {
    throw new OrderError("ENTREGA_INVALIDA");
  }
}

async function mpFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessTokenMp()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = (await respuesta.json().catch(() => null)) as T & {
    message?: string;
    error?: string;
  };

  if (!respuesta.ok) {
    const detalle =
      (body && typeof body === "object" && ("message" in body || "error" in body)
        ? String(body.message || body.error)
        : "") || `HTTP_${respuesta.status}`;
    throw new OrderError(`MERCADOPAGO_API:${detalle}`);
  }

  return body;
}

type PreferenciaMp = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

type PagoMp = {
  id: number;
  status: string;
  external_reference?: string | null;
};

export async function crearPreferenciaMercadoPago(opciones: {
  userId: string;
  email: string;
  items: ItemPedidoDto[];
  metodoPago: "debito" | "credito";
  cuotas?: number;
  entrega: EntregaDto;
}) {
  if (!mercadoPagoSecretConfigurado()) {
    throw new OrderError("MERCADOPAGO_NO_CONFIGURADO");
  }

  if (!["debito", "credito"].includes(opciones.metodoPago)) {
    throw new OrderError("METODO_PAGO_INVALIDO");
  }

  if (!Array.isArray(opciones.items) || opciones.items.length === 0) {
    throw new OrderError("ITEMS_INVALIDOS");
  }

  validarEntrega(opciones.entrega);

  const productos = await prisma.product.findMany({
    where: { id: { in: opciones.items.map((i) => i.id) } },
  });
  const mapa = new Map(productos.map((p) => [p.id, p]));

  let subtotalPesos = 0;
  const itemsValidados: {
    productId: string;
    nombre: string;
    precioUnitario: number;
    cantidad: number;
  }[] = [];

  for (const item of opciones.items) {
    if (!item.id || item.cantidad < 1) throw new OrderError("ITEMS_INVALIDOS");
    const producto = mapa.get(item.id);
    if (!producto) throw new OrderError("UNKNOWN_PRODUCT");
    if (producto.precio !== item.precio) throw new OrderError("PRICE_MISMATCH");
    if (!producto.enStock || producto.stock < item.cantidad) {
      throw new OrderError("SIN_STOCK");
    }
    subtotalPesos += producto.precio * item.cantidad;
    itemsValidados.push({
      productId: producto.id,
      nombre: item.nombre ?? producto.nombre,
      precioUnitario: producto.precio,
      cantidad: item.cantidad,
    });
  }

  let costoEnvio = 0;
  if (opciones.entrega.tipo === "envio" && opciones.entrega.envio) {
    const cotizacion = await cotizarEnvioPorCp(opciones.entrega.envio.codigoPostal);
    costoEnvio = cotizacion.costo;
  }

  const totalPesos = subtotalPesos + costoEnvio;
  if (totalPesos < 1) throw new OrderError("INVALID_AMOUNT");

  const cuotasPermitidas = [1, 3, 6, 12];
  const cuotas =
    opciones.metodoPago === "credito"
      ? cuotasPermitidas.includes(opciones.cuotas ?? 1)
        ? (opciones.cuotas as number)
        : 1
      : 1;

  const pedido = await prisma.$transaction(async (tx) => {
    await reservarStock(
      tx,
      itemsValidados.map((i) => ({ productId: i.productId, cantidad: i.cantidad }))
    );

    return tx.order.create({
      data: {
        userId: opciones.userId,
        email: opciones.email,
        estado: OrderStatus.pending_payment,
        metodoPago: opciones.metodoPago,
        totalPesos,
        costoEnvio,
        entrega: opciones.entrega as unknown as Prisma.InputJsonValue,
        cuotas,
        items: { create: itemsValidados },
      },
    });
  });

  const sitio = urlRetornoMercadoPago();
  const itemsPreferencia = [
    ...itemsValidados.map((item) => ({
      id: item.productId,
      title: item.nombre.slice(0, 250),
      quantity: item.cantidad,
      unit_price: item.precioUnitario,
      currency_id: "ARS",
    })),
    ...(costoEnvio > 0
      ? [
          {
            id: "envio",
            title: "Envío a domicilio",
            quantity: 1,
            unit_price: costoEnvio,
            currency_id: "ARS",
          },
        ]
      : []),
  ];

  try {
    const preferencia = await mpFetch<PreferenciaMp>("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify({
        items: itemsPreferencia,
        payer: { email: opciones.email },
        external_reference: pedido.id,
        metadata: {
          orderId: pedido.id,
          uid: opciones.userId,
          metodoPago: opciones.metodoPago,
          cuotas: String(cuotas),
        },
        back_urls: {
          success: `${sitio}/checkout/exito?orderId=${pedido.id}`,
          failure: `${sitio}/checkout/error?orderId=${pedido.id}`,
          pending: `${sitio}/checkout/exito?orderId=${pedido.id}&pending=1`,
        },
        auto_return: "approved",
        notification_url: `${sitio}/api/payments/mercadopago/webhook`,
        statement_descriptor: "AURA PRO",
      }),
    });

    const checkoutUrl = preferencia.sandbox_init_point || preferencia.init_point;
    if (!checkoutUrl) {
      throw new OrderError("MERCADOPAGO_SIN_CHECKOUT_URL");
    }

    await prisma.order.update({
      where: { id: pedido.id },
      data: { mercadopagoPreferenceId: preferencia.id },
    });

    return {
      orderId: pedido.id,
      preferenceId: preferencia.id,
      checkoutUrl,
      totalPesos,
    };
  } catch (error) {
    await prisma.$transaction(async (tx) => {
      await restaurarStock(
        tx,
        itemsValidados.map((i) => ({ productId: i.productId, cantidad: i.cantidad }))
      );
      await tx.order.update({
        where: { id: pedido.id },
        data: { estado: OrderStatus.cancelled },
      });
    });
    throw error;
  }
}

export async function procesarWebhookMercadoPago(input: {
  paymentId?: string | null;
  topic?: string | null;
}) {
  if (!mercadoPagoSecretConfigurado()) {
    throw new OrderError("MERCADOPAGO_NO_CONFIGURADO");
  }

  const topic = (input.topic || "payment").toLowerCase();
  if (topic !== "payment" && topic !== "merchant_order") {
    return { received: true as const, ignored: true as const };
  }

  const paymentId = input.paymentId?.trim();
  if (!paymentId) {
    return { received: true as const, ignored: true as const };
  }

  const pago = await mpFetch<PagoMp>(`/v1/payments/${paymentId}`);
  const orderId = pago.external_reference?.trim();
  if (!orderId) {
    return { received: true as const, ignored: true as const };
  }

  if (pago.status === "approved") {
    const pedido = await prisma.order.findUnique({ where: { id: orderId } });
    await prisma.order.updateMany({
      where: {
        id: orderId,
        estado: OrderStatus.pending_payment,
      },
      data: {
        estado: OrderStatus.paid,
        mercadopagoPaymentId: String(pago.id),
      },
    });
    if (pedido?.email) {
      void notificarPedidoCreado({
        email: pedido.email,
        orderId: pedido.id,
        totalPesos: pedido.totalPesos,
        estado: OrderStatus.paid,
      });
    }
    return { received: true as const };
  }

  if (["rejected", "cancelled", "refunded"].includes(pago.status)) {
    const pedido = await prisma.order.findFirst({
      where: {
        id: orderId,
        estado: OrderStatus.pending_payment,
      },
      include: { items: true },
    });

    if (pedido) {
      await prisma.$transaction(async (tx) => {
        await restaurarStock(
          tx,
          pedido.items.map((i) => ({ productId: i.productId, cantidad: i.cantidad }))
        );
        await tx.order.update({
          where: { id: pedido.id },
          data: {
            estado: OrderStatus.payment_failed,
            mercadopagoPaymentId: String(pago.id),
          },
        });
      });
    }
  }

  return { received: true as const };
}

import Stripe from "stripe";
import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cotizarEnvioPorCp } from "@/lib/shipping-server";
import {
  EntregaDto,
  ItemPedidoDto,
  OrderError,
  reservarStock,
  restaurarStock,
} from "@/lib/orders-server";

function obtenerStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new OrderError("STRIPE_NO_CONFIGURADO");
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

export function stripeSecretConfigurado(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
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

export async function crearPaymentIntentStripe(opciones: {
  userId: string;
  email: string;
  items: ItemPedidoDto[];
  metodoPago: "debito" | "credito";
  cuotas?: number;
  entrega: EntregaDto;
}) {
  if (!stripeSecretConfigurado()) {
    throw new OrderError("STRIPE_NO_CONFIGURADO");
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

  const stripeAmountCents = totalPesos * 100;
  const cuotas =
    opciones.metodoPago === "credito"
      ? Math.min(12, Math.max(1, opciones.cuotas ?? 1))
      : 1;

  const stripe = obtenerStripe();

  const intent = await stripe.paymentIntents.create({
    amount: stripeAmountCents,
    currency: "ars",
    automatic_payment_methods: { enabled: true },
    metadata: {
      uid: opciones.userId,
      metodoPago: opciones.metodoPago,
      cuotas: String(cuotas),
    },
  });

  try {
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
          stripeAmountCents,
          stripePaymentIntentId: intent.id,
          entrega: opciones.entrega as unknown as Prisma.InputJsonValue,
          cuotas,
          items: { create: itemsValidados },
        },
      });
    });

    return {
      orderId: pedido.id,
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret!,
      totalPesos,
    };
  } catch (error) {
    try {
      await stripe.paymentIntents.cancel(intent.id);
    } catch {
      // ignore cancel errors
    }
    throw error;
  }
}

export async function procesarWebhookStripe(
  rawBody: string | Buffer,
  signature: string
) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) throw new OrderError("WEBHOOK_NO_CONFIGURADO");

  const stripe = obtenerStripe();
  const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    await prisma.order.updateMany({
      where: {
        stripePaymentIntentId: pi.id,
        estado: OrderStatus.pending_payment,
      },
      data: { estado: OrderStatus.paid },
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const pedido = await prisma.order.findFirst({
      where: {
        stripePaymentIntentId: pi.id,
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
          data: { estado: OrderStatus.payment_failed },
        });
      });
    }
  }

  return { received: true as const };
}

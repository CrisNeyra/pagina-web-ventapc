import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { OrderStatus } from "@prisma/client";
import Stripe from "stripe";
import { PrismaService } from "../prisma/prisma.service";
import { ProductsService } from "../products/products.service";
import { ShippingService } from "../shipping/shipping.service";
import { RedisService } from "../redis/redis.service";
import { EntregaDto, ItemPedidoDto } from "../orders/orders.service";

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
    private readonly shippingService: ShippingService,
    private readonly redis: RedisService
  ) {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (key) {
      this.stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" });
    }
  }

  private getStripe(): Stripe {
    if (!this.stripe) throw new BadRequestException("STRIPE_NO_CONFIGURADO");
    return this.stripe;
  }

  private validarEntrega(entrega: EntregaDto) {
    if (entrega.tipo === "retiro") return;
    const envio = entrega.envio;
    if (
      !envio?.direccion?.trim() ||
      !envio?.ciudad?.trim() ||
      !envio?.codigoPostal?.trim() ||
      !envio?.telefonoContacto?.trim()
    ) {
      throw new BadRequestException("ENTREGA_INVALIDA");
    }
  }

  async crearPaymentIntent(opciones: {
    userId: string;
    email: string;
    items: ItemPedidoDto[];
    metodoPago: "debito" | "credito";
    cuotas?: number;
    entrega: EntregaDto;
    ip?: string;
  }) {
    if (opciones.ip) {
      const bloqueado = await this.redis.excedeRateLimit(`stripe:ip:${opciones.ip}`, 10);
      if (bloqueado) throw new ConflictException("RATE_LIMITED");
    }

    this.validarEntrega(opciones.entrega);

    const productos = await this.prisma.product.findMany({
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
      const producto = mapa.get(item.id);
      if (!producto) throw new BadRequestException("UNKNOWN_PRODUCT");
      if (producto.precio !== item.precio) throw new BadRequestException("PRICE_MISMATCH");
      if (!producto.enStock || producto.stock < item.cantidad) {
        throw new BadRequestException("SIN_STOCK");
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
      const cotizacion = await this.shippingService.cotizar(opciones.entrega.envio.codigoPostal);
      costoEnvio = cotizacion.costo;
    }

    const totalPesos = subtotalPesos + costoEnvio;
    const stripeAmountCents = totalPesos * 100;
    const cuotas = opciones.metodoPago === "credito"
      ? Math.min(12, Math.max(1, opciones.cuotas ?? 1))
      : 1;

    const stripe = this.getStripe();

    const pedido = await this.prisma.$transaction(async (tx) => {
      await this.productsService.reservarStock(
        tx,
        itemsValidados.map((i) => ({ productId: i.productId, cantidad: i.cantidad }))
      );

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
          entrega: opciones.entrega as object,
          cuotas,
          items: { create: itemsValidados },
        },
      });
    });

    const intent = await stripe.paymentIntents.retrieve(pedido.stripePaymentIntentId!);

    return {
      orderId: pedido.id,
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
      totalPesos,
    };
  }

  async procesarWebhook(req: Request & { rawBody?: Buffer }, signature: string) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!secret) throw new BadRequestException("WEBHOOK_NO_CONFIGURADO");

    const stripe = this.getStripe();
    const event = stripe.webhooks.constructEvent(
      req.rawBody as Buffer,
      signature,
      secret
    );

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      await this.prisma.order.updateMany({
        where: { stripePaymentIntentId: pi.id },
        data: { estado: OrderStatus.paid },
      });
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const pedido = await this.prisma.order.findFirst({
        where: { stripePaymentIntentId: pi.id },
        include: { items: true },
      });
      if (pedido) {
        await this.prisma.$transaction(async (tx) => {
          await this.productsService.restaurarStock(
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

    return { received: true };
  }
}

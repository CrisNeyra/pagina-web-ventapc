import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrderStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ProductsService } from "../products/products.service";
import { ShippingService } from "../shipping/shipping.service";
import { RedisService } from "../redis/redis.service";

export interface ItemPedidoDto {
  id: string;
  precio: number;
  cantidad: number;
  nombre?: string;
}

export interface EntregaDto {
  tipo: "retiro" | "envio";
  envio?: {
    direccion: string;
    ciudad: string;
    codigoPostal: string;
    telefonoContacto: string;
  };
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
    private readonly shippingService: ShippingService,
    private readonly redis: RedisService
  ) {}

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

  private calcularDescuentoTransferencia(subtotal: number) {
    return Math.round(subtotal * 0.1);
  }

  private estadoPorMetodo(metodo: string): OrderStatus {
    if (metodo === "efectivo") return OrderStatus.pending_cash;
    if (metodo === "transferencia") return OrderStatus.pending_transfer;
    return OrderStatus.pending_payment;
  }

  async crearOffline(opciones: {
    userId?: string;
    email?: string;
    items: ItemPedidoDto[];
    metodoPago: string;
    entrega: EntregaDto;
    idempotencyKey?: string;
    ip?: string;
  }) {
    if (opciones.ip) {
      const bloqueado = await this.redis.excedeRateLimit(`pedidos:ip:${opciones.ip}`, 10);
      if (bloqueado) throw new ConflictException("RATE_LIMITED");
    }
    if (opciones.userId) {
      const bloqueado = await this.redis.excedeRateLimit(`pedidos:uid:${opciones.userId}`, 10);
      if (bloqueado) throw new ConflictException("RATE_LIMITED");
    }

    if (!["efectivo", "transferencia"].includes(opciones.metodoPago)) {
      throw new BadRequestException("METODO_PAGO_INVALIDO");
    }

    this.validarEntrega(opciones.entrega);

    if (opciones.idempotencyKey) {
      const existente = await this.prisma.order.findUnique({
        where: { idempotencyKey: opciones.idempotencyKey },
      });
      if (existente) return existente;
    }

    const productos = await this.prisma.product.findMany({
      where: { id: { in: opciones.items.map((i) => i.id) } },
    });
    const mapa = new Map(productos.map((p) => [p.id, p]));

    let subtotal = 0;
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
      subtotal += producto.precio * item.cantidad;
      itemsValidados.push({
        productId: producto.id,
        nombre: item.nombre ?? producto.nombre,
        precioUnitario: producto.precio,
        cantidad: item.cantidad,
      });
    }

    let totalPesos = subtotal;
    if (opciones.metodoPago === "transferencia") {
      totalPesos -= this.calcularDescuentoTransferencia(subtotal);
    }

    let costoEnvio = 0;
    if (opciones.entrega.tipo === "envio" && opciones.entrega.envio) {
      const cotizacion = await this.shippingService.cotizar(opciones.entrega.envio.codigoPostal);
      costoEnvio = cotizacion.costo;
      totalPesos += costoEnvio;
    }

    return this.prisma.$transaction(async (tx) => {
      await this.productsService.reservarStock(
        tx,
        itemsValidados.map((i) => ({ productId: i.productId, cantidad: i.cantidad }))
      );

      return tx.order.create({
        data: {
          userId: opciones.userId,
          email: opciones.email,
          estado: this.estadoPorMetodo(opciones.metodoPago),
          metodoPago: opciones.metodoPago,
          totalPesos,
          costoEnvio,
          entrega: opciones.entrega as unknown as Prisma.InputJsonValue,
          idempotencyKey: opciones.idempotencyKey,
          items: {
            create: itemsValidados,
          },
        },
        include: { items: true },
      });
    });
  }

  async listarPorUsuario(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async listarPendientesAdmin() {
    return this.prisma.order.findMany({
      where: {
        estado: {
          in: [
            OrderStatus.pending_payment,
            OrderStatus.pending_cash,
            OrderStatus.pending_transfer,
          ],
        },
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async actualizarEstadoAdmin(orderId: string, nuevoEstado: OrderStatus) {
    const pedido = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!pedido) throw new NotFoundException("PEDIDO_NO_ENCONTRADO");

    const estadosPermitidos: OrderStatus[] = [
      OrderStatus.paid,
      OrderStatus.cancelled,
      OrderStatus.ready_for_pickup,
      OrderStatus.shipped,
    ];
    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new BadRequestException("ESTADO_INVALIDO");
    }

    return this.prisma.$transaction(async (tx) => {
      if (nuevoEstado === OrderStatus.cancelled) {
        await this.productsService.restaurarStock(
          tx,
          pedido.items.map((i) => ({ productId: i.productId, cantidad: i.cantidad }))
        );
      }

      return tx.order.update({
        where: { id: orderId },
        data: { estado: nuevoEstado },
        include: { items: true },
      });
    });
  }
}

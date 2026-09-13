import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cotizarEnvioPorCp } from "@/lib/shipping-server";

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

export class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderError";
  }
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

function descuentoTransferencia(subtotal: number) {
  return Math.round(subtotal * 0.1);
}

function estadoPorMetodo(metodo: string): OrderStatus {
  if (metodo === "efectivo") return OrderStatus.pending_cash;
  if (metodo === "transferencia") return OrderStatus.pending_transfer;
  return OrderStatus.pending_payment;
}

export async function reservarStock(
  tx: Prisma.TransactionClient,
  items: { productId: string; cantidad: number }[]
) {
  for (const item of items) {
    const actualizado = await tx.product.updateMany({
      where: {
        id: item.productId,
        stock: { gte: item.cantidad },
        enStock: true,
      },
      data: { stock: { decrement: item.cantidad } },
    });

    if (actualizado.count === 0) {
      throw new OrderError("SIN_STOCK");
    }

    const producto = await tx.product.findUnique({ where: { id: item.productId } });
    if (producto && producto.stock <= 0) {
      await tx.product.update({
        where: { id: item.productId },
        data: { enStock: false },
      });
    }
  }
}

export async function restaurarStock(
  tx: Prisma.TransactionClient,
  items: { productId: string; cantidad: number }[]
) {
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stock: { increment: item.cantidad },
        enStock: true,
      },
    });
  }
}

export async function crearPedidoOffline(opciones: {
  userId: string;
  email: string;
  items: ItemPedidoDto[];
  metodoPago: string;
  entrega: EntregaDto;
  idempotencyKey?: string;
}) {
  if (!["efectivo", "transferencia"].includes(opciones.metodoPago)) {
    throw new OrderError("METODO_PAGO_INVALIDO");
  }

  if (!Array.isArray(opciones.items) || opciones.items.length === 0) {
    throw new OrderError("ITEMS_INVALIDOS");
  }

  validarEntrega(opciones.entrega);

  if (opciones.idempotencyKey) {
    const existente = await prisma.order.findUnique({
      where: { idempotencyKey: opciones.idempotencyKey },
      include: { items: true },
    });
    if (existente) return existente;
  }

  const productos = await prisma.product.findMany({
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
    if (!item.id || item.cantidad < 1) throw new OrderError("ITEMS_INVALIDOS");
    const producto = mapa.get(item.id);
    if (!producto) throw new OrderError("UNKNOWN_PRODUCT");
    if (producto.precio !== item.precio) throw new OrderError("PRICE_MISMATCH");
    if (!producto.enStock || producto.stock < item.cantidad) {
      throw new OrderError("SIN_STOCK");
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
    totalPesos -= descuentoTransferencia(subtotal);
  }

  let costoEnvio = 0;
  if (opciones.entrega.tipo === "envio" && opciones.entrega.envio) {
    const cotizacion = await cotizarEnvioPorCp(opciones.entrega.envio.codigoPostal);
    costoEnvio = cotizacion.costo;
    totalPesos += costoEnvio;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await reservarStock(
        tx,
        itemsValidados.map((i) => ({ productId: i.productId, cantidad: i.cantidad }))
      );

      return tx.order.create({
        data: {
          userId: opciones.userId,
          email: opciones.email,
          estado: estadoPorMetodo(opciones.metodoPago),
          metodoPago: opciones.metodoPago,
          totalPesos,
          costoEnvio,
          entrega: opciones.entrega as unknown as Prisma.InputJsonValue,
          idempotencyKey: opciones.idempotencyKey,
          items: { create: itemsValidados },
        },
        include: { items: true },
      });
    });
  } catch (error) {
    if (error instanceof OrderError) throw error;
    throw error;
  }
}

export async function listarPedidosUsuario(userId: string) {
  const pedidos = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return pedidos.map((p) => ({
    id: p.id,
    estado: p.estado,
    totalPesos: p.totalPesos,
    metodoPago: p.metodoPago,
    createdAt: p.createdAt.toISOString(),
    items: p.items.map((i) => ({
      nombre: i.nombre,
      cantidad: i.cantidad,
      precioUnitario: i.precioUnitario,
    })),
  }));
}

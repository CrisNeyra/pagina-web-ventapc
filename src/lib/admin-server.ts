import { OrderStatus, PostulacionStatus } from "@prisma/client";
import { readFile } from "node:fs/promises";
import { isAbsolute, normalize, resolve } from "node:path";
import { prisma } from "@/lib/prisma";
import { OrderError, restaurarStock } from "@/lib/orders-server";

const ESTADOS_PENDIENTES: OrderStatus[] = [
  OrderStatus.pending_payment,
  OrderStatus.pending_cash,
  OrderStatus.pending_transfer,
];

const ESTADOS_ADMIN_PERMITIDOS: OrderStatus[] = [
  OrderStatus.paid,
  OrderStatus.cancelled,
  OrderStatus.ready_for_pickup,
  OrderStatus.shipped,
];

export async function listarPedidosPendientesAdmin() {
  const pedidos = await prisma.order.findMany({
    where: { estado: { in: ESTADOS_PENDIENTES } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return pedidos.map((p) => ({
    id: p.id,
    email: p.email,
    estado: p.estado,
    metodoPago: p.metodoPago,
    totalPesos: p.totalPesos,
    createdAt: p.createdAt.toISOString(),
    items: p.items.map((i) => ({
      productId: i.productId,
      nombre: i.nombre,
      cantidad: i.cantidad,
      precioUnitario: i.precioUnitario,
    })),
  }));
}

export async function actualizarEstadoPedidoAdmin(
  orderId: string,
  nuevoEstado: string
) {
  if (!ESTADOS_ADMIN_PERMITIDOS.includes(nuevoEstado as OrderStatus)) {
    throw new OrderError("ESTADO_INVALIDO");
  }

  const pedido = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!pedido) throw new OrderError("PEDIDO_NO_ENCONTRADO");

  const estado = nuevoEstado as OrderStatus;

  return prisma.$transaction(async (tx) => {
    if (estado === OrderStatus.cancelled) {
      await restaurarStock(
        tx,
        pedido.items.map((i) => ({ productId: i.productId, cantidad: i.cantidad }))
      );
    }

    return tx.order.update({
      where: { id: orderId },
      data: { estado },
      include: { items: true },
    });
  });
}

export async function listarPostulacionesAdmin() {
  const postulaciones = await prisma.postulacion.findMany({
    where: { estado: PostulacionStatus.recibida },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return postulaciones.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    email: p.email,
    telefono: p.telefono,
    cvNombre: p.cvNombre,
    createdAt: p.createdAt.toISOString(),
  }));
}

function raizUploads() {
  return resolve(process.cwd(), process.env.UPLOADS_DIR?.trim() || "uploads");
}

function resolverRutaCv(cvPath: string) {
  const root = raizUploads();
  const absoluto = isAbsolute(cvPath) ? normalize(cvPath) : resolve(root, cvPath);
  if (!absoluto.startsWith(root)) {
    throw new OrderError("CV_PATH_INVALIDO");
  }
  return absoluto;
}

export async function obtenerCvPostulacionAdmin(postulacionId: string) {
  const postulacion = await prisma.postulacion.findUnique({
    where: { id: postulacionId },
  });
  if (!postulacion) throw new OrderError("POSTULACION_NO_ENCONTRADA");

  try {
    const ruta = resolverRutaCv(postulacion.cvPath);
    const buffer = await readFile(ruta);
    return {
      buffer,
      nombre: postulacion.cvNombre || "cv.pdf",
    };
  } catch (error) {
    if (error instanceof OrderError) throw error;
    throw new OrderError("CV_NO_DISPONIBLE");
  }
}


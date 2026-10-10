import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { obtenerUsuarioDesdeRequest } from "@/lib/auth-server";
import { crearPedidoOffline, OrderError } from "@/lib/orders-server";
import { notificarPedidoCreado } from "@/lib/email-server";
import { esquemaPedido } from "@/lib/validacion";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "Falta DATABASE_URL (Neon/Postgres)." },
      { status: 503 }
    );
  }

  const user = await obtenerUsuarioDesdeRequest(request);
  if (!user) {
    return NextResponse.json({ message: "NO_AUTENTICADO" }, { status: 401 });
  }

  const crudo = await request.json().catch(() => null);
  const body = esquemaPedido.safeParse(crudo);
  if (!body.success) {
    return NextResponse.json({ message: "DATOS_INVALIDOS" }, { status: 400 });
  }

  const idempotencyKey =
    request.headers.get("idempotency-key")?.trim() || undefined;

  try {
    const pedido = await crearPedidoOffline({
      userId: user.id,
      email: user.email,
      items: body.data.items,
      metodoPago: body.data.metodoPago,
      entrega: body.data.entrega,
      idempotencyKey,
    });

    void notificarPedidoCreado({
      email: user.email,
      orderId: pedido.id,
      totalPesos: pedido.totalPesos,
      estado: pedido.estado,
    });

    return NextResponse.json({
      id: pedido.id,
      totalPesos: pedido.totalPesos,
      metodoPago: pedido.metodoPago,
      estado: pedido.estado,
      costoEnvio: pedido.costoEnvio,
    });
  } catch (error) {
    const mensaje = error instanceof OrderError ? error.message : "ERROR_PEDIDO";
    const status =
      mensaje === "SIN_STOCK" || mensaje === "PRICE_MISMATCH" ? 409 : 400;
    return NextResponse.json({ message: mensaje }, { status });
  }
}

import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { obtenerUsuarioDesdeRequest } from "@/lib/auth-server";
import {
  crearPedidoOffline,
  OrderError,
  type EntregaDto,
  type ItemPedidoDto,
} from "@/lib/orders-server";

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

  const body = (await request.json().catch(() => null)) as {
    items?: ItemPedidoDto[];
    metodoPago?: string;
    entrega?: EntregaDto;
  } | null;

  if (!body?.items || !body.metodoPago || !body.entrega) {
    return NextResponse.json({ message: "DATOS_INVALIDOS" }, { status: 400 });
  }

  const idempotencyKey =
    request.headers.get("idempotency-key")?.trim() || undefined;

  try {
    const pedido = await crearPedidoOffline({
      userId: user.id,
      email: user.email,
      items: body.items,
      metodoPago: body.metodoPago,
      entrega: body.entrega,
      idempotencyKey,
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

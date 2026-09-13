import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { obtenerUsuarioDesdeRequest } from "@/lib/auth-server";
import {
  OrderError,
  type EntregaDto,
  type ItemPedidoDto,
} from "@/lib/orders-server";
import { crearPaymentIntentStripe } from "@/lib/payments-server";

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
    return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    items?: ItemPedidoDto[];
    metodoPago?: "debito" | "credito";
    cuotas?: number;
    entrega?: EntregaDto;
  } | null;

  if (!body?.items || !body.metodoPago || !body.entrega) {
    return NextResponse.json({ message: "INVALID_ITEMS" }, { status: 400 });
  }

  try {
    const resultado = await crearPaymentIntentStripe({
      userId: user.id,
      email: user.email,
      items: body.items,
      metodoPago: body.metodoPago,
      cuotas: body.cuotas,
      entrega: body.entrega,
    });

    return NextResponse.json(resultado);
  } catch (error) {
    const mensaje =
      error instanceof OrderError ? error.message : "ERROR_PAYMENT_INTENT";
    const status =
      mensaje === "SIN_STOCK" || mensaje === "PRICE_MISMATCH" ? 409 : 400;
    return NextResponse.json({ message: mensaje }, { status });
  }
}

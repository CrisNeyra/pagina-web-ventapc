import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { verificarAdminRequest } from "@/lib/admin-auth";
import { actualizarEstadoPedidoAdmin } from "@/lib/admin-server";
import { OrderError } from "@/lib/orders-server";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "Falta DATABASE_URL (Neon/Postgres)." },
      { status: 503 }
    );
  }

  const admin = await verificarAdminRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ message: "NO_AUTORIZADO" }, { status: admin.status });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { estado?: string } | null;
  if (!body?.estado) {
    return NextResponse.json({ message: "ESTADO_INVALIDO" }, { status: 400 });
  }

  try {
    const pedido = await actualizarEstadoPedidoAdmin(id, body.estado);
    return NextResponse.json(pedido);
  } catch (error) {
    const mensaje = error instanceof OrderError ? error.message : "ERROR_ADMIN";
    const status =
      mensaje === "PEDIDO_NO_ENCONTRADO"
        ? 404
        : mensaje === "ESTADO_INVALIDO"
          ? 400
          : 400;
    return NextResponse.json({ message: mensaje }, { status });
  }
}

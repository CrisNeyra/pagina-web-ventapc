import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { verificarAdminRequest } from "@/lib/admin-auth";
import { listarPedidosPendientesAdmin } from "@/lib/admin-server";

export const runtime = "nodejs";

export async function GET(request: Request) {
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

  const pedidos = await listarPedidosPendientesAdmin();
  return NextResponse.json(pedidos);
}

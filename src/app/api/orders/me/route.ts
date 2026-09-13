import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { obtenerUsuarioDesdeRequest } from "@/lib/auth-server";
import { listarPedidosUsuario } from "@/lib/orders-server";

export const runtime = "nodejs";

export async function GET(request: Request) {
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

  const pedidos = await listarPedidosUsuario(user.id);
  return NextResponse.json(pedidos);
}

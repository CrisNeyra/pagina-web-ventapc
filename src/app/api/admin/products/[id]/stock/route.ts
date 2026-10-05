import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { verificarAdminRequest } from "@/lib/admin-auth";
import { actualizarStockProductoAdmin } from "@/lib/admin-server";
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
  const body = (await request.json().catch(() => null)) as {
    stock?: number;
    enStock?: boolean;
  } | null;

  if (typeof body?.stock !== "number") {
    return NextResponse.json({ message: "STOCK_INVALIDO" }, { status: 400 });
  }

  try {
    const producto = await actualizarStockProductoAdmin(id, body.stock, body.enStock);
    return NextResponse.json({
      id: producto.id,
      stock: producto.stock,
      enStock: producto.enStock,
    });
  } catch (error) {
    const mensaje = error instanceof OrderError ? error.message : "ERROR_STOCK";
    const status = mensaje === "PRODUCTO_NO_ENCONTRADO" ? 404 : 400;
    return NextResponse.json({ message: mensaje }, { status });
  }
}

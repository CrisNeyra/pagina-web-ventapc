import { NextResponse } from "next/server";
import { databaseUrlConfigurada, prisma } from "@/lib/prisma";
import { mapearProductoApi } from "@/lib/mapear-producto";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "Falta DATABASE_URL (Neon/Postgres)." },
      { status: 503 }
    );
  }

  const { id } = await context.params;
  const producto =
    (await prisma.product.findUnique({ where: { id } })) ??
    (await prisma.product.findUnique({ where: { slug: id } }));

  if (!producto) {
    return NextResponse.json({ message: "PRODUCTO_NO_ENCONTRADO" }, { status: 404 });
  }

  return NextResponse.json(mapearProductoApi(producto));
}

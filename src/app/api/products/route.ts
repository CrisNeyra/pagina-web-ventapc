import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { databaseUrlConfigurada, prisma } from "@/lib/prisma";
import { mapearProductoApi } from "@/lib/mapear-producto";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "Falta DATABASE_URL (Neon/Postgres)." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get("categoria") ?? undefined;
  const busqueda = searchParams.get("busqueda") ?? undefined;
  const soloStock = searchParams.get("soloStock") === "true";

  const where: Prisma.ProductWhereInput = {};
  if (categoria) where.categoria = categoria;
  if (soloStock) where.enStock = true;
  if (busqueda) {
    where.OR = [
      { nombre: { contains: busqueda, mode: "insensitive" } },
      { descripcion: { contains: busqueda, mode: "insensitive" } },
    ];
  }

  const productos = await prisma.product.findMany({
    where,
    orderBy: { nombre: "asc" },
    take: 100,
  });

  return NextResponse.json({
    productos: productos.map(mapearProductoApi),
    total: productos.length,
  });
}

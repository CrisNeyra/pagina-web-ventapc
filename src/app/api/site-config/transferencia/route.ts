import { NextResponse } from "next/server";
import { databaseUrlConfigurada, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "Falta DATABASE_URL (Neon/Postgres)." },
      { status: 503 }
    );
  }

  const config = await prisma.siteConfig.findUnique({
    where: { clave: "transferencia" },
  });

  if (!config) {
    return NextResponse.json(null);
  }

  return NextResponse.json(config.valor);
}

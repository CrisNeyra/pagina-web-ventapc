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
    where: { clave: "redes_sociales" },
  });

  if (!config) {
    return NextResponse.json([]);
  }

  return NextResponse.json(config.valor);
}

import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { cotizarEnvioPorCp } from "@/lib/shipping-server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "Falta DATABASE_URL (Neon/Postgres)." },
      { status: 503 }
    );
  }

  const cp = new URL(request.url).searchParams.get("cp") ?? "";
  const cotizacion = await cotizarEnvioPorCp(cp);
  return NextResponse.json(cotizacion);
}

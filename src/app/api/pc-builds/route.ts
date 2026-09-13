import { NextResponse } from "next/server";
import { obtenerUsuarioDesdeRequest } from "@/lib/auth-server";
import { ExtrasError, guardarPcBuild } from "@/lib/extras-server";
import { databaseUrlConfigurada } from "@/lib/prisma";

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
    return NextResponse.json({ message: "NO_AUTENTICADO" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    subtotal?: number;
    items?: unknown[];
  } | null;

  if (body?.subtotal == null || !Array.isArray(body.items)) {
    return NextResponse.json({ message: "DATOS_INVALIDOS" }, { status: 400 });
  }

  try {
    const build = await guardarPcBuild({
      userId: user.id,
      subtotal: body.subtotal,
      items: body.items,
    });
    return NextResponse.json(build);
  } catch (error) {
    const mensaje = error instanceof ExtrasError ? error.message : "ERROR_PC_BUILD";
    return NextResponse.json({ message: mensaje }, { status: 400 });
  }
}

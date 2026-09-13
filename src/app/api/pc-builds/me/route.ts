import { NextResponse } from "next/server";
import { obtenerUsuarioDesdeRequest } from "@/lib/auth-server";
import { listarPcBuildsUsuario } from "@/lib/extras-server";
import { databaseUrlConfigurada } from "@/lib/prisma";

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

  const builds = await listarPcBuildsUsuario(user.id);
  return NextResponse.json(builds);
}

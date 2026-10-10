import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { cambiarPasswordUsuario, obtenerUsuarioDesdeRequest } from "@/lib/auth-server";
import { esquemaCambioPassword } from "@/lib/validacion";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
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

  const crudo = await request.json().catch(() => null);
  const body = esquemaCambioPassword.safeParse(crudo);
  if (!body.success) {
    return NextResponse.json({ message: "DATOS_INVALIDOS" }, { status: 400 });
  }

  try {
    await cambiarPasswordUsuario(user.id, body.data.actual, body.data.nueva);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "ERROR";
    const status = mensaje === "CREDENCIALES_INVALIDAS" ? 401 : 400;
    return NextResponse.json({ message: mensaje }, { status });
  }
}

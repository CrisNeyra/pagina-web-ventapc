import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { databaseUrlConfigurada } from "@/lib/prisma";
import {
  nombreCookieAuth,
  obtenerUsuarioPorId,
  verificarToken,
} from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "Falta DATABASE_URL (Neon/Postgres)." },
      { status: 503 }
    );
  }

  const header = request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const jar = await cookies();
  const token = bearer ?? jar.get(nombreCookieAuth())?.value;

  if (!token) {
    return NextResponse.json({ message: "NO_AUTENTICADO" }, { status: 401 });
  }

  const payload = await verificarToken(token);
  if (!payload) {
    return NextResponse.json({ message: "TOKEN_INVALIDO" }, { status: 401 });
  }

  const user = await obtenerUsuarioPorId(payload.sub);
  if (!user) {
    return NextResponse.json({ message: "USUARIO_NO_ENCONTRADO" }, { status: 401 });
  }

  return NextResponse.json(user);
}

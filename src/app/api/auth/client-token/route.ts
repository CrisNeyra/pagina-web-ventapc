import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nombreCookieAuth, verificarToken } from "@/lib/auth-server";

export const runtime = "nodejs";

/** Espeja el JWT de la cookie httpOnly al cliente (login con Google). */
export async function GET() {
  const jar = await cookies();
  const token = jar.get(nombreCookieAuth())?.value;
  if (!token) {
    return NextResponse.json({ message: "NO_AUTENTICADO" }, { status: 401 });
  }

  const payload = await verificarToken(token);
  if (!payload) {
    return NextResponse.json({ message: "TOKEN_INVALIDO" }, { status: 401 });
  }

  return NextResponse.json({ token });
}

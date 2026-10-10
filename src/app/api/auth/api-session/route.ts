import { NextRequest, NextResponse } from "next/server";
import { AURA_TOKEN_COOKIE } from "@/tipos/auth-user";
import { opcionesCookieAuth } from "@/lib/auth-cookie";
import { verificarToken } from "@/lib/auth-server";

/** Solo el ramal Nest externo puede copiar un JWT a la cookie. El logout sigue en DELETE. */
export async function POST(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_API_URL?.trim()) {
    return NextResponse.json({ message: "API_SESSION_DESACTIVADA" }, { status: 410 });
  }

  try {
    const { token } = (await request.json()) as { token?: string };
    if (!token?.trim()) {
      return NextResponse.json({ error: "MISSING_TOKEN" }, { status: 400 });
    }

    const payload = await verificarToken(token);
    if (!payload) {
      return NextResponse.json({ error: "TOKEN_INVALIDO" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(opcionesCookieAuth(token));
    return response;
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AURA_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

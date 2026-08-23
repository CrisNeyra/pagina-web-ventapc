import { NextRequest, NextResponse } from "next/server";
import { AURA_TOKEN_COOKIE } from "@/tipos/auth-user";

const MAX_AGE_SEGUNDOS = 60 * 60 * 24 * 7;

/** Guarda el JWT Nest en cookie httpOnly para el proxy. */
export async function POST(request: NextRequest) {
  try {
    const { token } = (await request.json()) as { token?: string };
    if (!token?.trim()) {
      return NextResponse.json({ error: "MISSING_TOKEN" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: AURA_TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SEGUNDOS,
    });
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

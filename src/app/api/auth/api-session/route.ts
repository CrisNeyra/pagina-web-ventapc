import { NextResponse } from "next/server";
import { AURA_TOKEN_COOKIE } from "@/tipos/auth-user";

/** Cierra la cookie httpOnly `aura_token`. */
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

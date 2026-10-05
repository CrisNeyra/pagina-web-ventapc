import { NextResponse } from "next/server";
import {
  OAUTH_STATE_COOKIE,
  googleConfigurado,
  urlAutorizacionGoogle,
} from "@/lib/google-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!googleConfigurado()) {
    return NextResponse.redirect(new URL("/?authError=google_config", request.url));
  }

  const state = crypto.randomUUID();
  const respuesta = NextResponse.redirect(urlAutorizacionGoogle(request, state));
  respuesta.cookies.set({
    name: OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return respuesta;
}

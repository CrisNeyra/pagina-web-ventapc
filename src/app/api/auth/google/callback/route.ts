import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { opcionesCookieAuth } from "@/lib/auth-cookie";
import {
  OAUTH_STATE_COOKIE,
  intercambiarCodigoGoogle,
  usuarioDesdeGoogle,
} from "@/lib/google-auth";

export const runtime = "nodejs";

function volver(request: Request, codigo: string) {
  const destino = new URL("/", request.url);
  destino.searchParams.set("authError", codigo);
  const respuesta = NextResponse.redirect(destino);
  respuesta.cookies.set({
    name: OAUTH_STATE_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return respuesta;
}

export async function GET(request: Request) {
  if (!databaseUrlConfigurada()) {
    return volver(request, "google_error");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const stateCookie = jar.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !stateCookie || state !== stateCookie) {
    return volver(request, "google_state");
  }

  try {
    const { email } = await intercambiarCodigoGoogle(request, code);
    const sesion = await usuarioDesdeGoogle(email);
    const destino = new URL("/", request.url);
    const respuesta = NextResponse.redirect(destino);
    respuesta.cookies.set(opcionesCookieAuth(sesion.token));
    respuesta.cookies.set({
      name: OAUTH_STATE_COOKIE,
      value: "",
      path: "/",
      maxAge: 0,
    });
    return respuesta;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "";
    if (mensaje === "GOOGLE_EMAIL") return volver(request, "google_email");
    return volver(request, "google_error");
  }
}

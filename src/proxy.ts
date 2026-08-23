import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { esRutaProtegida } from "@/lib/rutas-protegidas";
import { AURA_TOKEN_COOKIE } from "@/tipos/auth-user";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!esRutaProtegida(pathname)) {
    return NextResponse.next();
  }

  const authMode = process.env.NEXT_PUBLIC_AUTH_MODE?.trim().toLowerCase();
  const modoNest =
    authMode === "nest" ||
    (!authMode && Boolean(process.env.NEXT_PUBLIC_API_URL?.trim()));

  if (modoNest) {
    const auraToken = request.cookies.get(AURA_TOKEN_COOKIE)?.value;
    if (auraToken) {
      return NextResponse.next();
    }
    // Sin cookie JWT: exigir login (salvo que no haya API en local sin cookie aún).
    if (process.env.NEXT_PUBLIC_API_URL?.trim()) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("auth", "required");
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Modo Firebase: cookie __session (requiere service account en el servidor).
  const adminConfigurado = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim());
  if (!adminConfigurado) {
    return NextResponse.next();
  }

  const session = request.cookies.get("__session")?.value;
  if (session) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("auth", "required");
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/usuario", "/usuario/:path*", "/checkout", "/checkout/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { esRutaProtegida } from "@/lib/rutas-protegidas";
import { AURA_TOKEN_COOKIE } from "@/tipos/auth-user";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!esRutaProtegida(pathname)) {
    return NextResponse.next();
  }

  if (!process.env.NEXT_PUBLIC_API_URL?.trim()) {
    return NextResponse.next();
  }

  const auraToken = request.cookies.get(AURA_TOKEN_COOKIE)?.value;
  if (auraToken) {
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

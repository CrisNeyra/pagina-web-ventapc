import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { esRutaProtegida } from "@/lib/rutas-protegidas";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!esRutaProtegida(pathname)) {
    return NextResponse.next();
  }

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

import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { loginUsuario } from "@/lib/auth-server";
import { opcionesCookieAuth } from "@/lib/auth-cookie";
import { claveRateLimit, limitarPeticion, respuestaRateLimit } from "@/lib/rate-limit";
import { esquemaLogin } from "@/lib/validacion";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "Falta DATABASE_URL (Neon/Postgres)." },
      { status: 503 }
    );
  }

  const limite = await limitarPeticion(claveRateLimit(request, "login"), 10, 15 * 60 * 1000);
  if (!limite.ok) {
    const r = respuestaRateLimit(limite.retryAfterSec);
    return NextResponse.json(r.body, r.init);
  }

  const crudo = await request.json().catch(() => null);
  const body = esquemaLogin.safeParse(crudo);
  if (!body.success) {
    return NextResponse.json({ message: "DATOS_INVALIDOS" }, { status: 400 });
  }

  try {
    const resultado = await loginUsuario(
      body.data.email,
      body.data.password,
      Boolean(body.data.recordarme)
    );
    const response = NextResponse.json({ user: resultado.user });
    response.cookies.set(opcionesCookieAuth(resultado.token));
    return response;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "ERROR";
    return NextResponse.json({ message: mensaje }, { status: 401 });
  }
}

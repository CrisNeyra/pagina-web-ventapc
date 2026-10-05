import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { loginUsuario } from "@/lib/auth-server";
import { opcionesCookieAuth } from "@/lib/auth-cookie";
import { claveRateLimit, limitarPeticion, respuestaRateLimit } from "@/lib/rate-limit";

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

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    recordarme?: boolean;
  } | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: "DATOS_INVALIDOS" }, { status: 400 });
  }

  try {
    const resultado = await loginUsuario(body.email, body.password, Boolean(body.recordarme));
    const response = NextResponse.json(resultado);
    response.cookies.set(opcionesCookieAuth(resultado.token));
    return response;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "ERROR";
    return NextResponse.json({ message: mensaje }, { status: 401 });
  }
}

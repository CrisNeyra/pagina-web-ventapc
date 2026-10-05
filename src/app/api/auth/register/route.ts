import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { registrarUsuario } from "@/lib/auth-server";
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

  const limite = await limitarPeticion(claveRateLimit(request, "register"), 5, 15 * 60 * 1000);
  if (!limite.ok) {
    const r = respuestaRateLimit(limite.retryAfterSec);
    return NextResponse.json(r.body, r.init);
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: "DATOS_INVALIDOS" }, { status: 400 });
  }

  try {
    const resultado = await registrarUsuario(body.email, body.password);
    const response = NextResponse.json(resultado);
    response.cookies.set(opcionesCookieAuth(resultado.token));
    return response;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "ERROR";
    const status = mensaje === "EMAIL_YA_REGISTRADO" ? 409 : 400;
    return NextResponse.json({ message: mensaje }, { status });
  }
}

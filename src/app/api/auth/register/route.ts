import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { registrarUsuario } from "@/lib/auth-server";
import { opcionesCookieAuth } from "@/lib/auth-cookie";
import { claveRateLimit, limitarPeticion, respuestaRateLimit } from "@/lib/rate-limit";
import { esquemaRegistro } from "@/lib/validacion";

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

  const crudo = await request.json().catch(() => null);
  const body = esquemaRegistro.safeParse(crudo);
  if (!body.success) {
    return NextResponse.json({ message: "DATOS_INVALIDOS" }, { status: 400 });
  }

  try {
    const resultado = await registrarUsuario(body.data.email, body.data.password);
    const response = NextResponse.json({ user: resultado.user });
    response.cookies.set(opcionesCookieAuth(resultado.token));
    return response;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "ERROR";
    const status = mensaje === "EMAIL_YA_REGISTRADO" ? 409 : 400;
    return NextResponse.json({ message: mensaje }, { status });
  }
}

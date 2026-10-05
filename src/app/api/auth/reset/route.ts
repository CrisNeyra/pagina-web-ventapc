import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { restablecerPassword } from "@/lib/auth-server";
import { claveRateLimit, limitarPeticion, respuestaRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "Falta DATABASE_URL (Neon/Postgres)." },
      { status: 503 }
    );
  }

  const limite = await limitarPeticion(claveRateLimit(request, "reset"), 10, 15 * 60 * 1000);
  if (!limite.ok) {
    const r = respuestaRateLimit(limite.retryAfterSec);
    return NextResponse.json(r.body, r.init);
  }

  const body = (await request.json().catch(() => null)) as {
    token?: string;
    password?: string;
  } | null;

  if (!body?.token || !body?.password) {
    return NextResponse.json({ message: "DATOS_INVALIDOS" }, { status: 400 });
  }

  try {
    await restablecerPassword(body.token, body.password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "ERROR";
    const status = mensaje === "TOKEN_INVALIDO" ? 401 : 400;
    return NextResponse.json({ message: mensaje }, { status });
  }
}

import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { nombreCookieAuth, registrarUsuario } from "@/lib/auth-server";

export const runtime = "nodejs";

function cookieAuth(token: string) {
  return {
    name: nombreCookieAuth(),
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function POST(request: Request) {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "Falta DATABASE_URL (Neon/Postgres)." },
      { status: 503 }
    );
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
    response.cookies.set(cookieAuth(resultado.token));
    return response;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "ERROR";
    const status = mensaje === "EMAIL_YA_REGISTRADO" ? 409 : 400;
    return NextResponse.json({ message: mensaje }, { status });
  }
}

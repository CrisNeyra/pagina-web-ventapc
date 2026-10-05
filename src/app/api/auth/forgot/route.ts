import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { solicitarRestablecerPassword } from "@/lib/auth-server";
import { emailConfigurado, notificarRestablecerPassword } from "@/lib/email-server";
import { claveRateLimit, limitarPeticion, respuestaRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MENSAJE_OK =
  "Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.";

function origenPublico(request: Request): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) return site.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "Falta DATABASE_URL (Neon/Postgres)." },
      { status: 503 }
    );
  }

  if (!emailConfigurado()) {
    return NextResponse.json(
      { message: "El envío de correo no está configurado (RESEND_API_KEY y EMAIL_FROM)." },
      { status: 503 }
    );
  }

  const limite = await limitarPeticion(claveRateLimit(request, "forgot"), 5, 15 * 60 * 1000);
  if (!limite.ok) {
    const r = respuestaRateLimit(limite.retryAfterSec);
    return NextResponse.json(r.body, r.init);
  }

  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ message: "DATOS_INVALIDOS" }, { status: 400 });
  }

  try {
    const token = await solicitarRestablecerPassword(email);
    if (token) {
      const enlace = `${origenPublico(request)}/restablecer?token=${encodeURIComponent(token)}`;
      const envio = await notificarRestablecerPassword({ email, enlace });
      if (!envio.enviado) {
        return NextResponse.json(
          { message: "No se pudo enviar el correo. Intentá de nuevo en unos minutos." },
          { status: 502 }
        );
      }
    }
    return NextResponse.json({ ok: true, message: MENSAJE_OK });
  } catch {
    return NextResponse.json({ message: "ERROR" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { solicitarRestablecerPassword } from "@/lib/auth-server";
import { emailConfigurado, notificarRestablecerPassword } from "@/lib/email-server";
import { claveRateLimit, limitarPeticion, respuestaRateLimit } from "@/lib/rate-limit";
import { esquemaOlvido } from "@/lib/validacion";

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

  const demoSinCorreo = process.env.NODE_ENV !== "production" && !emailConfigurado();
  if (!emailConfigurado() && !demoSinCorreo) {
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

  const crudo = await request.json().catch(() => null);
  const body = esquemaOlvido.safeParse(crudo);
  if (!body.success) {
    return NextResponse.json({ message: "DATOS_INVALIDOS" }, { status: 400 });
  }
  const email = body.data.email.toLowerCase();

  try {
    const token = await solicitarRestablecerPassword(email);
    if (token) {
      const enlace = `${origenPublico(request)}/restablecer?token=${encodeURIComponent(token)}`;
      if (demoSinCorreo) {
        return NextResponse.json({
          ok: true,
          message: "Modo demo: el correo no está configurado. Usá este enlace para restablecer la contraseña.",
          enlace,
        });
      }
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

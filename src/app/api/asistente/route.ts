import { NextResponse } from "next/server";
import {
  asistenteConfigurado,
  consultarGemini,
  textoCatalogo,
} from "@/lib/asistente-gemini";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { claveRateLimit, limitarPeticion, respuestaRateLimit } from "@/lib/rate-limit";
import { esquemaAsistente } from "@/lib/validacion";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ enabled: asistenteConfigurado() });
}

export async function POST(request: Request) {
  if (!asistenteConfigurado()) {
    return NextResponse.json(
      { message: "El asesor no está configurado." },
      { status: 503 }
    );
  }

  const limite = await limitarPeticion(claveRateLimit(request, "asistente"), 12, 60_000);
  if (!limite.ok) {
    const r = respuestaRateLimit(limite.retryAfterSec);
    return NextResponse.json(r.body, r.init);
  }

  const crudo = await request.json().catch(() => null);
  const body = esquemaAsistente.safeParse(crudo);
  if (!body.success) {
    return NextResponse.json({ message: "Escribí una consulta de hasta 1000 caracteres." }, { status: 400 });
  }

  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "El catálogo no está disponible en este momento." },
      { status: 503 }
    );
  }

  try {
    const catalogo = await textoCatalogo();
    const respuesta = await consultarGemini(body.data.mensaje, catalogo);
    return NextResponse.json({ respuesta });
  } catch {
    return NextResponse.json(
      { message: "No pude consultar el asesor. Intentá de nuevo en un momento." },
      { status: 502 }
    );
  }
}

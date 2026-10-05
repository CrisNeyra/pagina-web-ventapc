import { NextResponse } from "next/server";
import { liberarReservasEfectivoVencidas } from "@/lib/orders-server";

export const runtime = "nodejs";

/** Vercel Cron: libera stock de efectivo no retirado en 48 h. */
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET?.trim();
  if (!secreto) {
    return NextResponse.json({ message: "Falta CRON_SECRET." }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secreto}`) {
    return NextResponse.json({ message: "NO_AUTORIZADO" }, { status: 401 });
  }

  const resultado = await liberarReservasEfectivoVencidas();
  return NextResponse.json({ ok: true, ...resultado });
}

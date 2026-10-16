import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Checkout Pro se muestra si el access token está en el servidor (runtime, no el bundle). */
export async function GET() {
  return NextResponse.json({
    enabled: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()),
  });
}

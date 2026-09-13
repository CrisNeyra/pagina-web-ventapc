import { NextResponse } from "next/server";
import { OrderError } from "@/lib/orders-server";
import { procesarWebhookStripe } from "@/lib/payments-server";

export const runtime = "nodejs";

/** Stripe necesita el body crudo para verificar la firma. */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ message: "Falta stripe-signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  try {
    const resultado = await procesarWebhookStripe(rawBody, signature);
    return NextResponse.json(resultado);
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    const mensaje = error instanceof Error ? error.message : "WEBHOOK_ERROR";
    return NextResponse.json({ message: mensaje }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { OrderError } from "@/lib/orders-server";
import { procesarWebhookMercadoPago } from "@/lib/payments-server";

export const runtime = "nodejs";

function extraerPago(request: Request, body: unknown) {
  const url = new URL(request.url);
  const topic =
    url.searchParams.get("type") ||
    url.searchParams.get("topic") ||
    (body && typeof body === "object" && "type" in body
      ? String((body as { type?: string }).type || "")
      : null) ||
    (body && typeof body === "object" && "topic" in body
      ? String((body as { topic?: string }).topic || "")
      : null);

  const fromQuery =
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    null;

  const fromBody =
    body && typeof body === "object" && "data" in body
      ? String(
          ((body as { data?: { id?: string | number } }).data?.id as
            | string
            | number
            | undefined) ?? ""
        ) || null
      : null;

  return {
    topic,
    paymentId: fromQuery || fromBody,
  };
}

async function manejar(request: Request) {
  const raw = await request.text();
  let body: unknown = null;
  if (raw) {
    try {
      body = JSON.parse(raw) as unknown;
    } catch {
      body = null;
    }
  }

  const { topic, paymentId } = extraerPago(request, body);

  try {
    const resultado = await procesarWebhookMercadoPago({ topic, paymentId });
    return NextResponse.json(resultado);
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    const mensaje = error instanceof Error ? error.message : "WEBHOOK_ERROR";
    return NextResponse.json({ message: mensaje }, { status: 400 });
  }
}

/** IPN / Webhooks de Mercado Pago (GET o POST). */
export async function GET(request: Request) {
  return manejar(request);
}

export async function POST(request: Request) {
  return manejar(request);
}

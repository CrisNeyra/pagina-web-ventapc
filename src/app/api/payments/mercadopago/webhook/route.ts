import { NextResponse } from "next/server";
import { OrderError } from "@/lib/orders-server";
import { firmaWebhookMercadoPagoValida } from "@/lib/mercadopago-webhook";
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

  if (!paymentId) {
    return NextResponse.json({
      ok: true,
      received: true,
      ignored: true,
      hint: "Este URL es el receptor de webhooks de Mercado Pago. Configuralo en el panel (Webhooks / Notificaciones); abrir esta página en el navegador no registra el destination.",
    });
  }

  const secreto = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim() ?? "";
  if (secreto) {
    const url = new URL(request.url);
    const dataId = url.searchParams.get("data.id") || paymentId;
    const valida = firmaWebhookMercadoPagoValida({
      secret: secreto,
      signatureHeader: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
      dataId,
    });
    if (!valida) {
      return NextResponse.json({ message: "FIRMA_INVALIDA" }, { status: 401 });
    }
  }

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

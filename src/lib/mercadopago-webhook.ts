import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Valida `x-signature` de Mercado Pago.
 * Manifest: `id:{data.id};request-id:{x-request-id};ts:{ts};`
 * https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export function firmaWebhookMercadoPagoValida(input: {
  secret: string;
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string | null;
}): boolean {
  const secret = input.secret.trim();
  if (!secret) return true;

  const header = input.signatureHeader?.trim();
  const requestId = input.requestId?.trim();
  if (!header || !requestId) return false;

  let ts = "";
  let v1 = "";
  for (const parte of header.split(",")) {
    const idx = parte.indexOf("=");
    if (idx <= 0) continue;
    const clave = parte.slice(0, idx).trim();
    const valor = parte.slice(idx + 1).trim();
    if (clave === "ts") ts = valor;
    if (clave === "v1") v1 = valor;
  }
  if (!ts || !v1) return false;

  const id = (input.dataId ?? "").trim().toLowerCase();
  const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
  const esperado = createHmac("sha256", secret).update(manifest).digest("hex");

  const firma = Buffer.from(v1, "utf8");
  const calculada = Buffer.from(esperado, "utf8");
  if (firma.length !== calculada.length) return false;
  return timingSafeEqual(firma, calculada);
}

import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { firmaWebhookMercadoPagoValida } from "./mercadopago-webhook";

const secret = "clave-webhook-test";
const dataId = "123456";
const requestId = "req-abc";
const ts = "1700000000";

function firmar(id = dataId) {
  const manifest = `id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac("sha256", secret).update(manifest).digest("hex");
  return `ts=${ts},v1=${v1}`;
}

describe("firmaWebhookMercadoPagoValida", () => {
  it("acepta el aviso si no hay secreto configurado", () => {
    expect(
      firmaWebhookMercadoPagoValida({
        secret: "",
        signatureHeader: null,
        requestId: null,
        dataId: null,
      })
    ).toBe(true);
  });

  it("acepta una firma HMAC válida", () => {
    expect(
      firmaWebhookMercadoPagoValida({
        secret,
        signatureHeader: firmar(),
        requestId,
        dataId,
      })
    ).toBe(true);
  });

  it("rechaza una firma alterada", () => {
    expect(
      firmaWebhookMercadoPagoValida({
        secret,
        signatureHeader: `ts=${ts},v1=${"0".repeat(64)}`,
        requestId,
        dataId,
      })
    ).toBe(false);
  });

  it("normaliza el id alfanumérico a minúsculas", () => {
    expect(
      firmaWebhookMercadoPagoValida({
        secret,
        signatureHeader: firmar("abcDEF"),
        requestId,
        dataId: "ABCdef",
      })
    ).toBe(true);
  });
});

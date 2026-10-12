import { describe, it, expect } from "vitest";
import { esUrlPublicaHttps, normalizarUrlAbsoluta, SITE_URL_DEFAULT } from "./site-url";

describe("site-url", () => {
  it("normaliza host sin esquema a https", () => {
    expect(normalizarUrlAbsoluta("proaurapro.vercel.app")).toBe(
      "https://proaurapro.vercel.app"
    );
    expect(normalizarUrlAbsoluta("https://proaurapro.vercel.app/")).toBe(
      "https://proaurapro.vercel.app"
    );
  });

  it("rechaza localhost/http para retornos de Mercado Pago", () => {
    expect(esUrlPublicaHttps("http://localhost:3000")).toBe(false);
    expect(esUrlPublicaHttps("https://localhost")).toBe(false);
    expect(esUrlPublicaHttps(SITE_URL_DEFAULT)).toBe(true);
  });
});

vi.mock("@/servicios/apiBackendServicio", () => ({
  crearPreferenciaMercadoPagoEnApi: vi.fn(async () => ({
    orderId: "order-123",
    preferenceId: "pref_123",
    checkoutUrl: "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_123",
    totalPesos: 100000,
  })),
}));

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { crearPreferenciaPago } from "./pagosServicio";
import { crearPreferenciaMercadoPagoEnApi } from "@/servicios/apiBackendServicio";

describe("crearPreferenciaPago", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgresql://test@localhost/aurapro");
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rechaza carrito vacío sin llamar a la API", async () => {
    const resultado = await crearPreferenciaPago([]);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain("vacío");
    }
    expect(crearPreferenciaMercadoPagoEnApi).not.toHaveBeenCalled();
  });

  it("crea preferencia vía API", async () => {
    const resultado = await crearPreferenciaPago(
      [{ id: "gpu-001", precio: 100000, cantidad: 1 }]
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.orderId).toBe("order-123");
      expect(resultado.checkoutUrl).toContain("mercadopago");
    }
    expect(crearPreferenciaMercadoPagoEnApi).toHaveBeenCalled();
  });

  it("pasa metodoPago y cuotas a la API", async () => {
    await crearPreferenciaPago(
      [{ id: "gpu-001", precio: 100000, cantidad: 1 }],
      { metodoPago: "credito", cuotas: 6 }
    );

    expect(crearPreferenciaMercadoPagoEnApi).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ metodoPago: "credito", cuotas: 6 })
    );
  });
});

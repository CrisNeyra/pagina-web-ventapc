vi.mock("@/datos/preciosCatalogo", () => ({
  preciosCatalogo: {
    "gpu-001": 100000,
  },
}));

vi.mock("@/lib/api-token", () => ({
  obtenerApiToken: vi.fn(() => "api-token-test"),
}));

vi.mock("@/servicios/apiBackendServicio", () => ({
  crearPaymentIntentEnApi: vi.fn(async () => ({
    orderId: "order-123",
    paymentIntentId: "pi_123",
    clientSecret: "cs_test_123",
  })),
}));

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { crearPaymentIntent } from "./pagosServicio";
import { crearPaymentIntentEnApi } from "@/servicios/apiBackendServicio";

describe("crearPaymentIntent", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:4000/api");
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rechaza carrito vacío sin llamar a la API", async () => {
    const resultado = await crearPaymentIntent([], "token-test");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain("vacío");
    }
    expect(crearPaymentIntentEnApi).not.toHaveBeenCalled();
  });

  it("crea payment intent vía Nest", async () => {
    const resultado = await crearPaymentIntent(
      [{ id: "gpu-001", precio: 100000, cantidad: 1 }],
      "token-test"
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.orderId).toBe("order-123");
      expect(resultado.clientSecret).toBe("cs_test_123");
    }
    expect(crearPaymentIntentEnApi).toHaveBeenCalled();
  });

  it("pasa metodoPago y cuotas a la API", async () => {
    await crearPaymentIntent(
      [{ id: "gpu-001", precio: 100000, cantidad: 1 }],
      "token-test",
      { metodoPago: "credito", cuotas: 6 }
    );

    expect(crearPaymentIntentEnApi).toHaveBeenCalledWith(
      expect.any(Array),
      "api-token-test",
      expect.objectContaining({ metodoPago: "credito", cuotas: 6 })
    );
  });
});

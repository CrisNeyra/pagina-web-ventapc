vi.mock("@/datos/preciosCatalogo", () => ({
  preciosCatalogo: {
    "gpu-001": 100000,
  },
}));

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { crearPaymentIntent } from "./pagosServicio";

describe("crearPaymentIntent", () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CREATE_PAYMENT_INTENT_URL", "https://test.example/payment-intent");
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
    vi.unstubAllEnvs();
  });

  it("rechaza carrito vacío sin llamar al servidor", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const resultado = await crearPaymentIntent([], "token-test");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain("vacío");
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("crea payment intent con token y items válidos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        orderId: "order-123",
        paymentIntentId: "pi_123",
        clientSecret: "cs_test_123",
      }),
    });

    const resultado = await crearPaymentIntent(
      [{ id: "gpu-001", precio: 100000, cantidad: 1 }],
      "token-test"
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.orderId).toBe("order-123");
      expect(resultado.clientSecret).toBe("cs_test_123");
    }

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test.example/payment-intent",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token-test",
        }),
      })
    );
  });

  it("envía metodoPago y cuotas al crear payment intent", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        orderId: "order-456",
        paymentIntentId: "pi_456",
        clientSecret: "cs_test_456",
      }),
    });

    await crearPaymentIntent(
      [{ id: "gpu-001", precio: 100000, cantidad: 1 }],
      "token-test",
      { metodoPago: "credito", cuotas: 6 }
    );

    const llamada = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(llamada[1].body as string);

    expect(body.metodoPago).toBe("credito");
    expect(body.cuotas).toBe(6);
    expect(body.metadata.cuotas).toBe("6");
  });

  it("mapea error de autorización", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "UNAUTHORIZED" }),
    });

    const resultado = await crearPaymentIntent(
      [{ id: "gpu-001", precio: 100000, cantidad: 1 }],
      "token-invalido"
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain("sesión");
    }
  });

  it("maneja errores de red", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network"));

    const resultado = await crearPaymentIntent(
      [{ id: "gpu-001", precio: 100000, cantidad: 1 }],
      "token-test"
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain("red");
    }
  });
});

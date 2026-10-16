import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique, updateMany } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique, updateMany },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/email-server", () => ({
  notificarPedidoCreado: vi.fn(),
}));

vi.mock("@/lib/shipping-server", () => ({
  cotizarEnvioPorCp: vi.fn(),
}));

import { procesarWebhookMercadoPago } from "@/lib/payments-server";

describe("procesarWebhookMercadoPago", () => {
  beforeEach(() => {
    vi.stubEnv("MERCADOPAGO_ACCESS_TOKEN", "TEST-token");
    findUnique.mockReset();
    updateMany.mockReset();
    updateMany.mockResolvedValue({ count: 1 });
    findUnique.mockResolvedValue({
      id: "ord-1",
      email: null,
      totalPesos: 1000,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          id: 99,
          status: "approved",
          external_reference: "ord-1",
        }),
      }))
    );
  });

  it("marca el pedido como pagado y guarda el id de Mercado Pago", async () => {
    const resultado = await procesarWebhookMercadoPago({
      topic: "payment",
      paymentId: "99",
    });

    expect(resultado).toEqual({ received: true });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "ord-1", estado: "pending_payment" },
      data: { estado: "paid", mercadopagoPaymentId: "99" },
    });
  });
});

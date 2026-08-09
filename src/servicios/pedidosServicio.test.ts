import { describe, it, expect } from "vitest";
import { etiquetaEstadoPedido } from "./pedidosServicio";

describe("etiquetaEstadoPedido", () => {
  it("traduce estados conocidos", () => {
    expect(etiquetaEstadoPedido("pending_payment")).toBe("Pendiente de pago");
    expect(etiquetaEstadoPedido("paid")).toBe("Pagado");
    expect(etiquetaEstadoPedido("payment_failed")).toBe("Pago fallido");
  });

  it("devuelve el estado original si no está mapeado", () => {
    expect(etiquetaEstadoPedido("custom_status")).toBe("custom_status");
  });
});

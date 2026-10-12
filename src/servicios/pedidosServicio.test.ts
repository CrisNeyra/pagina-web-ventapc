import { describe, it, expect } from "vitest";
import {
  etiquetaEstadoPedido,
  etiquetaMetodoPago,
  montoPedidoEnPesos,
} from "./pedidosServicio";

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

describe("etiquetaMetodoPago", () => {
  it("traduce métodos conocidos", () => {
    expect(etiquetaMetodoPago("efectivo")).toBe("Efectivo en el local");
    expect(etiquetaMetodoPago("credito")).toBe("Tarjeta de crédito");
  });
});

describe("montoPedidoEnPesos", () => {
  it("devuelve el total en pesos", () => {
    expect(montoPedidoEnPesos({ amount: 250000 })).toBe(250000);
    expect(montoPedidoEnPesos({ amount: 225000, paymentIntentId: "legacy" })).toBe(225000);
  });
});

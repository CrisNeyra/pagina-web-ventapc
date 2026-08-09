import { describe, it, expect } from "vitest";
import {
  calcularCuota,
  calcularDescuentoTransferencia,
  calcularSubtotal,
  calcularTotalCheckout,
} from "./checkout";

describe("checkout", () => {
  const items = [
    { precio: 100000, cantidad: 2 },
    { precio: 50000, cantidad: 1 },
  ];

  it("calcula el subtotal", () => {
    expect(calcularSubtotal(items)).toBe(250000);
  });

  it("aplica 10% de descuento en transferencia", () => {
    expect(calcularDescuentoTransferencia(250000)).toBe(25000);
    expect(calcularTotalCheckout(items, "transferencia")).toBe(225000);
  });

  it("mantiene el total en otros métodos", () => {
    expect(calcularTotalCheckout(items, "efectivo")).toBe(250000);
    expect(calcularTotalCheckout(items, "debito")).toBe(250000);
  });

  it("calcula cuotas sin interés", () => {
    expect(calcularCuota(120000, 12)).toBe(10000);
  });
});

import { describe, it, expect } from "vitest";
import { calcularDescuento, formatearPrecio } from "./formato";

describe("formatearPrecio", () => {
  it("formatea un número como moneda argentina", () => {
    const resultado = formatearPrecio(389999);
    expect(resultado).toContain("389");
    expect(resultado).toMatch(/\$|ARS/);
  });

  it("formatea cero sin decimales", () => {
    const resultado = formatearPrecio(0);
    expect(resultado).toMatch(/\$|ARS/);
    expect(resultado).toContain("0");
  });
});

describe("calcularDescuento", () => {
  it("calcula el porcentaje de descuento redondeado", () => {
    expect(calcularDescuento(800, 1000)).toBe(20);
    expect(calcularDescuento(750, 1000)).toBe(25);
  });

  it("retorna 0 si no hay descuento", () => {
    expect(calcularDescuento(1000, 1000)).toBe(0);
  });
});

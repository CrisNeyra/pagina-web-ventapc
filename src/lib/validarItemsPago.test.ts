import { describe, it, expect } from "vitest";
import {
  calcularMontoCentavos,
  validarItemsContraCatalogo,
  validarItemsPagoBasicos,
} from "./validarItemsPago";

const catalogo = {
  "gpu-001": 899999,
  "ram-001": 89999,
};

describe("validarItemsPagoBasicos", () => {
  it("acepta items válidos", () => {
    expect(
      validarItemsPagoBasicos([{ id: "gpu-001", precio: 100, cantidad: 2 }])
    ).toBe(true);
  });

  it("rechaza items vacíos o inválidos", () => {
    expect(validarItemsPagoBasicos([])).toBe(false);
    expect(validarItemsPagoBasicos([{ id: "", precio: 100 }])).toBe(false);
  });
});

describe("validarItemsContraCatalogo", () => {
  it("valida precios contra el catálogo", () => {
    const resultado = validarItemsContraCatalogo(
      [{ id: "gpu-001", precio: 899999, cantidad: 1 }],
      catalogo
    );
    expect(resultado.ok).toBe(true);
  });

  it("rechaza precios manipulados", () => {
    const resultado = validarItemsContraCatalogo(
      [{ id: "gpu-001", precio: 1, cantidad: 1 }],
      catalogo
    );
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error).toBe("PRICE_MISMATCH");
  });

  it("rechaza productos desconocidos", () => {
    const resultado = validarItemsContraCatalogo(
      [{ id: "fake-999", precio: 100, cantidad: 1 }],
      catalogo
    );
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error).toBe("UNKNOWN_PRODUCT");
  });
});

describe("calcularMontoCentavos", () => {
  it("calcula el monto en centavos", () => {
    expect(
      calcularMontoCentavos([{ id: "gpu-001", precio: 1000.5, cantidad: 2 }])
    ).toBe(200100);
  });
});

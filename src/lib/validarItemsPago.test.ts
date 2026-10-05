import { describe, it, expect } from "vitest";
import { validarItemsPagoBasicos } from "./validarItemsPago";

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

import { describe, it, expect } from "vitest";
import { esRutaProtegida } from "./rutas-protegidas";

describe("esRutaProtegida", () => {
  it("protege /usuario y /checkout", () => {
    expect(esRutaProtegida("/usuario")).toBe(true);
    expect(esRutaProtegida("/checkout")).toBe(true);
  });

  it("no protege páginas públicas de checkout", () => {
    expect(esRutaProtegida("/checkout/exito")).toBe(false);
    expect(esRutaProtegida("/checkout/error")).toBe(false);
  });

  it("no protege rutas públicas", () => {
    expect(esRutaProtegida("/")).toBe(false);
    expect(esRutaProtegida("/productos")).toBe(false);
  });
});

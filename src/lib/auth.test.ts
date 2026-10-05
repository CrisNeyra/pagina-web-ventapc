import { describe, it, expect } from "vitest";
import { validarPassword } from "./auth";

describe("validarPassword", () => {
  it("acepta contraseña de 10+ con letra y número", () => {
    expect(validarPassword("AuraPro2026")).toBe(true);
    expect(validarPassword("segura1234")).toBe(true);
  });

  it("rechaza contraseñas cortas o el patrón demo viejo", () => {
    expect(validarPassword("1234ab")).toBe(false);
    expect(validarPassword("12ab34")).toBe(false);
    expect(validarPassword("")).toBe(false);
  });

  it("exige letra y número", () => {
    expect(validarPassword("abcdefghij")).toBe(false);
    expect(validarPassword("1234567890")).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { validarPassword } from "./auth";

describe("validarPassword", () => {
  it("acepta contraseña con 4 números y 2 letras (6 caracteres)", () => {
    expect(validarPassword("12ab34")).toBe(true);
    expect(validarPassword("1234ab")).toBe(true);
    expect(validarPassword("ab1234")).toBe(true);
  });

  it("rechaza contraseña con menos de 6 caracteres", () => {
    expect(validarPassword("12ab3")).toBe(false);
    expect(validarPassword("")).toBe(false);
  });

  it("rechaza contraseña con menos de 4 números", () => {
    expect(validarPassword("12ab3c")).toBe(false);
    expect(validarPassword("abc123")).toBe(false);
  });

  it("rechaza contraseña con menos de 2 letras", () => {
    expect(validarPassword("12345a")).toBe(false);
    expect(validarPassword("123456")).toBe(false);
  });

  it("rechaza contraseña con caracteres especiales", () => {
    expect(validarPassword("12ab3!")).toBe(false);
    expect(validarPassword("12 ab3")).toBe(false);
  });
});

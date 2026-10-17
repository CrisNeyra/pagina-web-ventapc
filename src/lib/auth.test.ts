import { describe, it, expect } from "vitest";
import { validarPassword } from "./auth";

describe("validarPassword", () => {
  it("acepta entre 6 y 10 caracteres con letra y número", () => {
    expect(validarPassword("abc123")).toBe(true);
    expect(validarPassword("segura123")).toBe(true);
  });

  it("rechaza fuera de 6 a 10 caracteres", () => {
    expect(validarPassword("ab12")).toBe(false);
    expect(validarPassword("segura12345")).toBe(false);
    expect(validarPassword("")).toBe(false);
  });

  it("exige letra y número", () => {
    expect(validarPassword("abcdef")).toBe(false);
    expect(validarPassword("123456")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { huellaPassword } from "./password-reset";

describe("huellaPassword", () => {
  it("cambia si cambia el hash y distingue una cuenta sin contraseña", () => {
    expect(huellaPassword("hash-a")).not.toBe(huellaPassword("hash-b"));
    expect(huellaPassword(null)).not.toBe(huellaPassword("hash-a"));
    expect(huellaPassword("hash-a")).toBe(huellaPassword("hash-a"));
  });
});
import { describe, it, expect } from "vitest";
import { limitarPeticion } from "./rate-limit";

describe("limitarPeticion (memoria)", () => {
  it("permite hasta el límite y luego 429", async () => {
    const clave = `test-${Date.now()}-${Math.random()}`;
    const a = await limitarPeticion(clave, 2, 60_000);
    const b = await limitarPeticion(clave, 2, 60_000);
    const c = await limitarPeticion(clave, 2, 60_000);
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    expect(c.ok).toBe(false);
  });
});

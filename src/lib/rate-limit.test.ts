import { describe, it, expect, beforeEach } from "vitest";
import { excedeRateLimit } from "./rate-limit";

describe("excedeRateLimit", () => {
  beforeEach(() => {
    // Cada test usa clave única para evitar estado compartido entre tests
  });

  it("permite solicitudes dentro del límite", () => {
    const clave = `test-${Date.now()}-ok`;
    expect(excedeRateLimit(clave, 3)).toBe(false);
    expect(excedeRateLimit(clave, 3)).toBe(false);
    expect(excedeRateLimit(clave, 3)).toBe(false);
  });

  it("bloquea cuando se supera el límite", () => {
    const clave = `test-${Date.now()}-block`;
    expect(excedeRateLimit(clave, 2)).toBe(false);
    expect(excedeRateLimit(clave, 2)).toBe(false);
    expect(excedeRateLimit(clave, 2)).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { REDES_SOCIALES } from "./redesSociales";

describe("REDES_SOCIALES", () => {
  it("tiene enlaces HTTPS válidos (no href vacío ni #)", () => {
    expect(REDES_SOCIALES.length).toBeGreaterThan(0);

    for (const red of REDES_SOCIALES) {
      expect(red.href).toMatch(/^https:\/\//);
      expect(red.href).not.toBe("#");
      expect(red.label.trim().length).toBeGreaterThan(0);
    }
  });
});

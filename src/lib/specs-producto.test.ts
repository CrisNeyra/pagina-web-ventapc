import { describe, expect, it } from "vitest";
import { filasSpecsTecnicas } from "./specs-producto";

describe("filasSpecsTecnicas", () => {
  it("formatea campos conocidos", () => {
    const filas = filasSpecsTecnicas({ socket: "AM5", ddr: "DDR5", watts: 750 });
    expect(filas.some((f) => f.valor.includes("AM5"))).toBe(true);
    expect(filas.some((f) => f.valor === "DDR5")).toBe(true);
  });

  it("devuelve vacío sin specs", () => {
    expect(filasSpecsTecnicas(null)).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { datosClaveProducto, filasSpecsTecnicas } from "./specs-producto";

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

describe("datosClaveProducto", () => {
  it("prioriza categoría, specs y la descripción real", () => {
    const datos = datosClaveProducto({
      categoria: "Procesadores",
      descripcion:
        "8 Núcleos, 16 Hilos, 5.0GHz, AM5.\nCategoría: Procesadores con enfoque en rendimiento y calidad.",
      specs: { socket: "AM5", tdp: 120 },
    });

    expect(datos[0]).toBe("Categoría: Procesadores");
    expect(datos).toContain("Procesador (socket): Socket AM5");
    expect(datos).toContain("Consumo CPU: 120 W TDP");
    expect(datos.some((dato) => dato.includes("8 Núcleos"))).toBe(true);
    expect(datos.some((dato) => /enfoque en rendimiento/i.test(dato))).toBe(false);
  });
});

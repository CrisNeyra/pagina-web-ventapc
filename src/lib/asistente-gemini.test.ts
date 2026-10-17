import { describe, expect, it } from "vitest";
import { armarTextoCatalogo, extraerTextoGemini } from "./asistente-gemini";

describe("extraerTextoGemini", () => {
  it("junta el texto de la respuesta", () => {
    expect(
      extraerTextoGemini({
        candidates: [{ content: { parts: [{ text: "Hay stock. " }, { text: "Socket AM5." }] } }],
      })
    ).toBe("Hay stock. Socket AM5.");
  });

  it("devuelve null si la respuesta no trae texto", () => {
    expect(extraerTextoGemini({})).toBeNull();
    expect(extraerTextoGemini({ candidates: [] })).toBeNull();
  });
});

describe("armarTextoCatalogo", () => {
  const filas = [
    {
      nombre: "Fuente Corsair 750W",
      precio: 120000,
      stock: 4,
      enStock: true,
      categoria: "Fuentes",
      descripcion: "Fuente modular.",
      specs: { watts: 750 },
    },
    {
      nombre: "RTX 4070",
      precio: 800000,
      stock: 2,
      enStock: true,
      categoria: "GPU",
      descripcion: "Placa de video.",
      specs: { consumoGpu: 200 },
    },
  ];

  it("lista todo el catálogo y detalla solo lo que nombra la consulta", () => {
    const texto = armarTextoCatalogo(filas, "¿Hay fuentes en stock?");
    expect(texto).toContain("Fuente Corsair 750W");
    expect(texto).toContain("watts=750");
    expect(texto).not.toContain("consumoGpu=200");
  });
});

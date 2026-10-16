import { describe, expect, it } from "vitest";
import { extraerTextoGemini } from "./asistente-gemini";

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

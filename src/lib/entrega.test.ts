import { describe, it, expect } from "vitest";
import {
  costoEntrega,
  validarDatosEntrega,
  COSTO_ENVIO_PESOS,
} from "./entrega";

describe("validarDatosEntrega", () => {
  it("acepta retiro en local", () => {
    expect(validarDatosEntrega({ tipo: "retiro" })).toEqual({ ok: true });
  });

  it("rechaza envío sin datos", () => {
    const resultado = validarDatosEntrega({ tipo: "envio" });
    expect(resultado.ok).toBe(false);
  });

  it("acepta envío con datos completos", () => {
    const resultado = validarDatosEntrega({
      tipo: "envio",
      envio: {
        direccion: "Av. Siempre Viva 742",
        ciudad: "Buenos Aires",
        codigoPostal: "1425",
        telefonoContacto: "+54 11 5555-5555",
      },
    });
    expect(resultado).toEqual({ ok: true });
  });
});

describe("costoEntrega", () => {
  it("no cobra retiro", () => {
    expect(costoEntrega("retiro")).toBe(0);
  });

  it("cobra envío fijo", () => {
    expect(costoEntrega("envio")).toBe(COSTO_ENVIO_PESOS);
  });
});

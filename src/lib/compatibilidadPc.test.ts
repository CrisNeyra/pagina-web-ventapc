import { describe, expect, it } from "vitest";
import { builderProducts } from "@/datos/pcBuilder";
import { especificacionesPc } from "@/datos/especificacionesPc";
import { choquesDeSeleccion, choquesPorIds, motivoIncompatibilidad } from "@/lib/compatibilidadPc";
import type { BuilderProduct } from "@/tipos/pcBuilder";

function producto(id: string): BuilderProduct {
  const encontrado = builderProducts.find((item) => item.id === id);
  if (!encontrado) throw new Error(id);
  return encontrado;
}

describe("compatibilidad de Armá tu PC", () => {
  it("marca la mother Intel si el procesador es AM5", () => {
    const cpu = producto("proc-001");
    const mother = producto("mother-001");
    expect(motivoIncompatibilidad(mother, { procesador: cpu })).toMatch(/AM5/);
    expect(motivoIncompatibilidad(mother, { procesador: cpu })).toMatch(/LGA1700/);
  });

  it("acepta Ryzen 7000 con B650 y DDR5", () => {
    const seleccion = {
      procesador: producto("proc-001"),
      motherboard: producto("mother-002"),
      ram: producto("ram-001"),
    };
    expect(choquesDeSeleccion(seleccion)).toEqual([]);
  });

  it("rechaza DDR4 en una mother DDR5", () => {
    const motivo = motivoIncompatibilidad(producto("ram-003"), {
      motherboard: producto("mother-002"),
    });
    expect(motivo).toMatch(/DDR4/);
    expect(motivo).toMatch(/DDR5/);
  });

  it("el líquido no cubre un procesador AM4", () => {
    especificacionesPc["proc-am4-test"] = { socket: "AM4", tdp: 65 };
    const cpuAm4: BuilderProduct = {
      ...producto("proc-001"),
      id: "proc-am4-test",
      nombre: "Ryzen AM4",
    };
    expect(
      choquesDeSeleccion({
        procesador: cpuAm4,
        cooler: producto("cooler-002"),
      })[0]
    ).toMatch(/AM4/);
    delete especificacionesPc["proc-am4-test"];
  });

  it("exige más watts cuando la GPU supera la fuente", () => {
    const mensajes = choquesDeSeleccion({
      procesador: producto("proc-002"),
      gpu: producto("gpu-003"),
      fuente: producto("fuente-001"),
    });
    expect(mensajes[0]).toMatch(/550 W/);
  });

  it("la API rechaza un Ryzen AM5 con mother LGA1700", () => {
    expect(choquesPorIds(["proc-001", "mother-001"])[0]).toMatch(/AM5/);
    expect(choquesPorIds(["proc-001"])).toEqual([]);
  });

  it("el almacenamiento no genera choques", () => {
    expect(
      motivoIncompatibilidad(producto("ssd-003"), {
        procesador: producto("proc-004"),
        motherboard: producto("mother-001"),
      })
    ).toBeNull();
  });
});

import {
  especificacionesPc,
  MARGEN_FUENTE_W,
  type EspecificacionPc,
} from "@/datos/especificacionesPc";
import type { BuilderCategoryId, BuilderProduct } from "@/tipos/pcBuilder";

export type SeleccionPc = Partial<Record<BuilderCategoryId, BuilderProduct>>;

function specDe(producto: { id: string; specs?: EspecificacionPc }): EspecificacionPc {
  return producto.specs ?? especificacionesPc[producto.id] ?? {};
}

function wattsNecesarios(cpu?: EspecificacionPc, gpu?: EspecificacionPc): number {
  return (cpu?.tdp ?? 0) + (gpu?.consumoGpu ?? 0) + MARGEN_FUENTE_W;
}

export function choquesDeSeleccion(seleccion: SeleccionPc): string[] {
  const mensajes: string[] = [];
  const cpu = seleccion.procesador ? specDe(seleccion.procesador) : undefined;
  const mother = seleccion.motherboard ? specDe(seleccion.motherboard) : undefined;
  const ram = seleccion.ram ? specDe(seleccion.ram) : undefined;
  const cooler = seleccion.cooler ? specDe(seleccion.cooler) : undefined;
  const gpu = seleccion.gpu ? specDe(seleccion.gpu) : undefined;
  const fuente = seleccion.fuente ? specDe(seleccion.fuente) : undefined;
  const gabinete = seleccion.gabinete ? specDe(seleccion.gabinete) : undefined;

  if (cpu?.socket && mother?.socket && cpu.socket !== mother.socket) {
    mensajes.push(
      `Socket ${cpu.socket}, esta mother es ${mother.socket}.`
    );
  }

  if (mother?.ddr && ram?.ddr && mother.ddr !== ram.ddr) {
    mensajes.push(
      `Esta memoria es ${ram.ddr} y la mother usa ${mother.ddr}.`
    );
  }

  if (cpu?.socket && cooler?.socketsCooler && !cooler.socketsCooler.includes(cpu.socket)) {
    mensajes.push(`Este cooler no cubre el socket ${cpu.socket}.`);
  }

  if (
    mother?.factor &&
    gabinete?.factoresGabinete &&
    !gabinete.factoresGabinete.includes(mother.factor)
  ) {
    mensajes.push(`El gabinete no entra una mother ${mother.factor}.`);
  }

  if (fuente?.watts != null && (cpu?.tdp || gpu?.consumoGpu)) {
    const necesario = wattsNecesarios(cpu, gpu);
    if (fuente.watts < necesario) {
      mensajes.push(
        `La fuente de ${fuente.watts} W no alcanza (hace falta ${necesario} W).`
      );
    }
  }

  return mensajes;
}

export function motivoIncompatibilidad(
  candidato: BuilderProduct,
  seleccion: SeleccionPc
): string | null {
  const sinCategoria: SeleccionPc = { ...seleccion };
  delete sinCategoria[candidato.categoria];
  const previos = new Set(choquesDeSeleccion(sinCategoria));
  const siguientes = choquesDeSeleccion({
    ...sinCategoria,
    [candidato.categoria]: candidato,
  });
  return siguientes.find((mensaje) => !previos.has(mensaje)) ?? null;
}

const CATEGORIA_POR_ID: Record<string, BuilderCategoryId> = {
  "proc-001": "procesador",
  "proc-002": "procesador",
  "proc-003": "procesador",
  "proc-004": "procesador",
  "mother-001": "motherboard",
  "mother-002": "motherboard",
  "mother-003": "motherboard",
  "cooler-001": "cooler",
  "cooler-002": "cooler",
  "ram-001": "ram",
  "ram-002": "ram",
  "ram-003": "ram",
  "ram-004": "ram",
  "gpu-001": "gpu",
  "gpu-002": "gpu",
  "gpu-003": "gpu",
  "ssd-001": "almacenamiento",
  "ssd-002": "almacenamiento",
  "ssd-003": "almacenamiento",
  "ssd-004": "almacenamiento",
  "fuente-001": "fuente",
  "fuente-002": "fuente",
  "fuente-003": "fuente",
  "combo-001": "gabinete",
};

/** Rechaza un carrito con dos o más piezas de armado que no encajan. */
export function choquesPorIds(ids: string[]): string[] {
  const seleccion: SeleccionPc = {};
  for (const id of ids) {
    const categoria = CATEGORIA_POR_ID[id];
    if (!categoria || !especificacionesPc[id]) continue;
    seleccion[categoria] = {
      id,
      categoria,
      nombre: id,
      descripcion: "",
      precio: 0,
      imagen: "",
      stock: true,
      specs: especificacionesPc[id],
    };
  }
  if (Object.keys(seleccion).length < 2) return [];
  return choquesDeSeleccion(seleccion);
}

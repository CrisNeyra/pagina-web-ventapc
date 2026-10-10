export type SocketCpu = "AM5" | "AM4" | "LGA1700";
export type TipoDdr = "DDR4" | "DDR5";
export type FactorForma = "mATX" | "ATX";

export interface EspecificacionPc {
  socket?: SocketCpu;
  socketsCooler?: SocketCpu[];
  ddr?: TipoDdr;
  tdp?: number;
  watts?: number;
  consumoGpu?: number;
  factor?: FactorForma;
  factoresGabinete?: FactorForma[];
}

/** Margen fijo que la fuente tiene que cubrir además de CPU y GPU. */
export const MARGEN_FUENTE_W = 150;

export const especificacionesPc: Record<string, EspecificacionPc> = {
  "proc-001": { socket: "AM5", tdp: 120 },
  "proc-002": { socket: "LGA1700", tdp: 253 },
  "proc-003": { socket: "AM5", tdp: 105 },
  "proc-004": { socket: "LGA1700", tdp: 181 },
  "mother-001": { socket: "LGA1700", ddr: "DDR4", factor: "mATX" },
  "mother-002": { socket: "AM5", ddr: "DDR5", factor: "mATX" },
  "mother-003": { socket: "AM4", ddr: "DDR4", factor: "ATX" },
  "cooler-001": { socketsCooler: ["AM5", "AM4", "LGA1700"] },
  "cooler-002": { socketsCooler: ["AM5", "LGA1700"] },
  "ram-001": { ddr: "DDR5" },
  "ram-002": { ddr: "DDR5" },
  "ram-003": { ddr: "DDR4" },
  "ram-004": { ddr: "DDR5" },
  "gpu-001": { consumoGpu: 263 },
  "gpu-002": { consumoGpu: 115 },
  "gpu-003": { consumoGpu: 450 },
  "fuente-001": { watts: 550 },
  "fuente-002": { watts: 750 },
  "fuente-003": { watts: 850 },
  "combo-001": { factoresGabinete: ["mATX", "ATX"] },
};

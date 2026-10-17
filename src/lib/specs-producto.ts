import type { EspecificacionPc } from "@/datos/especificacionesPc";

const ETIQUETAS: Record<string, (valor: unknown) => string | null> = {
  socket: (v) => (typeof v === "string" ? `Socket ${v}` : null),
  ddr: (v) => (typeof v === "string" ? v : null),
  tdp: (v) => (typeof v === "number" ? `${v} W TDP` : null),
  watts: (v) => (typeof v === "number" ? `${v} W` : null),
  consumoGpu: (v) => (typeof v === "number" ? `${v} W GPU` : null),
  factor: (v) => (typeof v === "string" ? `Factor ${v}` : null),
  socketsCooler: (v) =>
    Array.isArray(v) && v.length ? `Cooler: ${v.join(", ")}` : null,
  factoresGabinete: (v) =>
    Array.isArray(v) && v.length ? `Gabinete: ${v.join(", ")}` : null,
};

const NOMBRES: Record<string, string> = {
  socket: "Procesador (socket)",
  ddr: "Tipo de memoria",
  tdp: "Consumo CPU",
  watts: "Potencia fuente",
  consumoGpu: "Consumo GPU",
  factor: "Factor de forma",
  socketsCooler: "Sockets cooler",
  factoresGabinete: "Formatos gabinete",
};

export function filasSpecsTecnicas(
  specs?: EspecificacionPc | null
): { clave: string; valor: string }[] {
  if (!specs) return [];
  return Object.entries(specs)
    .map(([key, valor]) => {
      const formatear = ETIQUETAS[key];
      const texto = formatear ? formatear(valor) : null;
      if (!texto) return null;
      return { clave: NOMBRES[key] ?? key, valor: texto };
    })
    .filter((fila): fila is { clave: string; valor: string } => fila !== null);
}

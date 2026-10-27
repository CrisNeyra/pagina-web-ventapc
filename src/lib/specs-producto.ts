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

const RELLENO_DESCRIPCION = [
  /con enfoque en rendimiento y calidad/i,
  /componentes y terminaciones seleccionadas/i,
  /incluye garantía oficial y soporte postventa/i,
];

/** Datos cortos para el bloque "Lo que tenés que saber", sin el relleno genérico del catálogo. */
export function datosClaveProducto(input: {
  descripcion: string;
  categoria: string;
  specs?: EspecificacionPc | null;
}): string[] {
  const tecnicos = filasSpecsTecnicas(input.specs).map(
    (fila) => `${fila.clave}: ${fila.valor}`
  );
  const lineas = input.descripcion
    .split(/\n+|(?<=\.)\s+/)
    .map((linea) => linea.trim().replace(/\.$/, ""))
    .filter((linea) => linea && !RELLENO_DESCRIPCION.some((regla) => regla.test(linea)));

  const vistos = new Set<string>();
  const datos: string[] = [];
  for (const item of [`Categoría: ${input.categoria}`, ...tecnicos, ...lineas]) {
    const clave = item.toLowerCase();
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    datos.push(item);
  }
  return datos.slice(0, 12);
}

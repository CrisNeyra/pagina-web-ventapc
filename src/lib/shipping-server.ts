import { prisma } from "@/lib/prisma";

const COSTO_FALLBACK = 5000;

export async function cotizarEnvioPorCp(
  codigoPostal: string
): Promise<{ costo: number; zona: string }> {
  const cp = codigoPostal.trim();
  const zonas = await prisma.shippingZone.findMany({
    where: { activo: true },
    orderBy: { costo: "asc" },
  });

  for (const zona of zonas) {
    if (zona.codigosPostales.includes("*")) {
      continue;
    }
    const prefijo = cp.slice(0, 2);
    if (zona.codigosPostales.some((p) => cp.startsWith(p) || prefijo === p)) {
      return { costo: zona.costo, zona: zona.nombre };
    }
  }

  const fallback = zonas.find((z) => z.codigosPostales.includes("*"));
  return {
    costo: fallback?.costo ?? COSTO_FALLBACK,
    zona: fallback?.nombre ?? "Estándar",
  };
}

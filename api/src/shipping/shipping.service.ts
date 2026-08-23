import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  async cotizar(codigoPostal: string): Promise<{ costo: number; zona: string }> {
    const cp = codigoPostal.trim();
    const zonas = await this.prisma.shippingZone.findMany({
      where: { activo: true },
      orderBy: { costo: "asc" },
    });

    for (const zona of zonas) {
      if (zona.codigosPostales.includes("*")) {
        return { costo: zona.costo, zona: zona.nombre };
      }
      const prefijo = cp.slice(0, 2);
      if (zona.codigosPostales.some((p) => cp.startsWith(p) || prefijo === p)) {
        return { costo: zona.costo, zona: zona.nombre };
      }
    }

    const fallback = zonas.find((z) => z.codigosPostales.includes("*"));
    return {
      costo: fallback?.costo ?? 5000,
      zona: fallback?.nombre ?? "Estándar",
    };
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SiteConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async obtener(clave: string) {
    const config = await this.prisma.siteConfig.findUnique({ where: { clave } });
    return config?.valor ?? null;
  }

  async obtenerTransferencia() {
    return (await this.obtener("transferencia")) as {
      banco: string;
      titular: string;
      cbu: string;
      alias: string;
    } | null;
  }

  async obtenerRedesSociales() {
    return (await this.obtener("redes_sociales")) as
      | { id: string; label: string; href: string }[]
      | null;
  }
}

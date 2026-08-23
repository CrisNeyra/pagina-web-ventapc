import { Controller, Get } from "@nestjs/common";
import { SiteConfigService } from "./site-config.service";

@Controller("site-config")
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Get("transferencia")
  transferencia() {
    return this.siteConfigService.obtenerTransferencia();
  }

  @Get("redes-sociales")
  redes() {
    return this.siteConfigService.obtenerRedesSociales();
  }
}

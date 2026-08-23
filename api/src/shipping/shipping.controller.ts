import { Controller, Get, Query } from "@nestjs/common";
import { ShippingService } from "./shipping.service";

@Controller("shipping")
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get("quote")
  cotizar(@Query("cp") cp: string) {
    return this.shippingService.cotizar(cp ?? "");
  }
}

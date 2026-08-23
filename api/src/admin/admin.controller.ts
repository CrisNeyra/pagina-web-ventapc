import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { OrdersService } from "../orders/orders.service";
import { PostulacionesService } from "../postulaciones/postulaciones.service";
import { ProductsService } from "../products/products.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly postulacionesService: PostulacionesService,
    private readonly productsService: ProductsService
  ) {}

  @Get("orders")
  pedidos() {
    return this.ordersService.listarPendientesAdmin();
  }

  @Patch("orders/:id")
  actualizarPedido(
    @Param("id") id: string,
    @Body() body: { estado: OrderStatus }
  ) {
    return this.ordersService.actualizarEstadoAdmin(id, body.estado);
  }

  @Get("postulaciones")
  postulaciones() {
    return this.postulacionesService.listarRecibidas();
  }

  @Get("postulaciones/:id/cv")
  cv(@Param("id") id: string) {
    return this.postulacionesService.urlCv(id);
  }

  @Patch("products/:id/stock")
  stock(
    @Param("id") id: string,
    @Body() body: { stock: number; enStock?: boolean }
  ) {
    return this.productsService.actualizarStock(id, body.stock, body.enStock);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
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
  async cv(@Param("id") id: string, @Res() res: Response) {
    const { buffer, nombre } = await this.postulacionesService.obtenerCv(id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(nombre)}"`
    );
    res.send(buffer);
  }

  @Patch("products/:id/stock")
  stock(
    @Param("id") id: string,
    @Body() body: { stock: number; enStock?: boolean }
  ) {
    return this.productsService.actualizarStock(id, body.stock, body.enStock);
  }
}

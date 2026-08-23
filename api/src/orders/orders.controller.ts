import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { OrdersService, EntregaDto, ItemPedidoDto } from "./orders.service";

interface JwtUser {
  sub: string;
  email: string;
}

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  crear(
    @CurrentUser() user: JwtUser,
    @Body()
    body: {
      items: ItemPedidoDto[];
      metodoPago: string;
      entrega: EntregaDto;
    },
    @Headers("idempotency-key") idempotencyKey: string | undefined,
    @Req() req: Request
  ) {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.socket.remoteAddress ??
      "unknown";

    return this.ordersService.crearOffline({
      userId: user.sub,
      email: user.email,
      items: body.items,
      metodoPago: body.metodoPago,
      entrega: body.entrega,
      idempotencyKey,
      ip,
    });
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  misPedidos(@CurrentUser() user: JwtUser) {
    return this.ordersService.listarPorUsuario(user.sub);
  }
}

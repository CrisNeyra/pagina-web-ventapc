import {
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { PaymentsService } from "./payments.service";
import { EntregaDto, ItemPedidoDto } from "../orders/orders.service";

interface JwtUser {
  sub: string;
  email: string;
}

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("stripe/intent")
  @UseGuards(JwtAuthGuard)
  crearIntent(
    @CurrentUser() user: JwtUser,
    @Body()
    body: {
      items: ItemPedidoDto[];
      metodoPago: "debito" | "credito";
      cuotas?: number;
      entrega: EntregaDto;
    },
    @Req() req: Request
  ) {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.socket.remoteAddress ??
      "unknown";

    return this.paymentsService.crearPaymentIntent({
      userId: user.sub,
      email: user.email,
      items: body.items,
      metodoPago: body.metodoPago,
      cuotas: body.cuotas,
      entrega: body.entrega,
      ip,
    });
  }

  @Post("stripe/webhook")
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string
  ) {
    return this.paymentsService.procesarWebhook(req, signature);
  }
}

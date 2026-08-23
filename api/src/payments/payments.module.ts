import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { ProductsModule } from "../products/products.module";
import { ShippingModule } from "../shipping/shipping.module";

@Module({
  imports: [ProductsModule, ShippingModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}

import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { ProductsModule } from "../products/products.module";
import { ShippingModule } from "../shipping/shipping.module";

@Module({
  imports: [ProductsModule, ShippingModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

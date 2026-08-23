import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { OrdersModule } from "../orders/orders.module";
import { PostulacionesModule } from "../postulaciones/postulaciones.module";
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [OrdersModule, PostulacionesModule, ProductsModule],
  controllers: [AdminController],
})
export class AdminModule {}

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { HealthModule } from "./health/health.module";
import { ProductsModule } from "./products/products.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { ShippingModule } from "./shipping/shipping.module";
import { SiteConfigModule } from "./site-config/site-config.module";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";
import { PostulacionesModule } from "./postulaciones/postulaciones.module";
import { PcBuildsModule } from "./pc-builds/pc-builds.module";
import { StorageModule } from "./storage/storage.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60,
      },
    ]),
    PrismaModule,
    RedisModule,
    StorageModule,
    HealthModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    ShippingModule,
    SiteConfigModule,
    AuthModule,
    AdminModule,
    PostulacionesModule,
    PcBuildsModule,
  ],
})
export class AppModule {}

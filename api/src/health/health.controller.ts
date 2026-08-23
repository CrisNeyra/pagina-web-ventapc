import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { StorageService } from "../storage/storage.service";

@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly storage: StorageService
  ) {}

  @Get()
  async health() {
    let postgres = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      postgres = true;
    } catch {
      postgres = false;
    }

    const redis = await this.redis.ping();
    const minio = await this.storage.ping();
    const stripe = Boolean(process.env.STRIPE_SECRET_KEY?.trim());

    const ok = postgres && redis;

    return {
      ok,
      services: {
        postgres,
        redis,
        minio,
        stripe,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

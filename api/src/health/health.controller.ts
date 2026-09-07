import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { StorageService } from "../storage/storage.service";

@Controller("health")
@SkipThrottle()
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
    const storage = await this.storage.ping();
    const stripe = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
    const redisConfigured = Boolean(process.env.REDIS_URL?.trim());
    const email = Boolean(
      process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim()
    );
    const storageMode = this.storage.usaStorageLocal() ? "local" : "minio";

    // Demo cloud: basta Postgres. Redis/MinIO/email son opcionales.
    const ok = postgres && (!redisConfigured || redis);

    return {
      ok,
      services: {
        postgres,
        redis,
        storage,
        storageMode,
        stripe,
        email,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

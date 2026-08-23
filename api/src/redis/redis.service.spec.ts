import { RedisService } from "./redis.service";

describe("RedisService", () => {
  it("no bloquea rate limit sin REDIS_URL", async () => {
    delete process.env.REDIS_URL;
    const servicio = new RedisService();
    const bloqueado = await servicio.excedeRateLimit("test-key", 1);
    expect(bloqueado).toBe(false);
    await servicio.onModuleDestroy();
  });
});

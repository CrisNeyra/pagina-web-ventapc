import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;

  getClient(): Redis | null {
    const url = process.env.REDIS_URL?.trim();
    if (!url) return null;

    if (!this.client) {
      this.client = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true });
    }
    return this.client;
  }

  async ping(): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      if (client.status !== "ready") await client.connect();
      const result = await client.ping();
      return result === "PONG";
    } catch {
      return false;
    }
  }

  async excedeRateLimit(clave: string, maximo = 10, ventanaSeg = 60): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    try {
      if (client.status !== "ready") await client.connect();
      const key = `rl:${clave}`;
      const count = await client.incr(key);
      if (count === 1) {
        await client.expire(key, ventanaSeg);
      }
      return count > maximo;
    } catch {
      return false;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}

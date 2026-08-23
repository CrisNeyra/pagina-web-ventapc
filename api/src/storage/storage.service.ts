import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class StorageService implements OnModuleInit {
  private client: S3Client | null = null;
  private bucket = process.env.MINIO_BUCKET ?? "aurapro";

  private getClient(): S3Client | null {
    const endpoint = process.env.MINIO_ENDPOINT?.trim();
    if (!endpoint) return null;

    if (!this.client) {
      const port = process.env.MINIO_PORT ?? "9000";
      const useSsl = process.env.MINIO_USE_SSL === "true";
      this.client = new S3Client({
        region: "us-east-1",
        endpoint: `${useSsl ? "https" : "http"}://${endpoint}:${port}`,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY ?? "aurapro",
          secretAccessKey: process.env.MINIO_SECRET_KEY ?? "aurapro_minio_dev",
        },
      });
    }
    return this.client;
  }

  async onModuleInit() {
    const client = this.getClient();
    if (!client) return;

    try {
      await client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    } catch {
      // bucket ya existe
    }
  }

  async ping(): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      await client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: ".healthcheck",
        Body: "ok",
      }));
      return true;
    } catch {
      return false;
    }
  }

  async subirArchivo(path: string, body: Buffer, contentType: string): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("STORAGE_NO_CONFIGURADO");

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: body,
        ContentType: contentType,
      })
    );
  }

  async urlFirmada(path: string, expiraSeg = 900): Promise<string> {
    const client = this.getClient();
    if (!client) throw new Error("STORAGE_NO_CONFIGURADO");

    return getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: this.bucket, Key: path }),
      { expiresIn: expiraSeg }
    );
  }
}

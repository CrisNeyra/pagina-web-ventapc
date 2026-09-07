import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import {
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { constants as fsConstants } from "node:fs";

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: S3Client | null = null;
  private bucket = process.env.MINIO_BUCKET ?? "aurapro";
  private localRoot = resolve(process.cwd(), process.env.UPLOADS_DIR?.trim() || "uploads");

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

  usaStorageLocal(): boolean {
    return !this.getClient();
  }

  async onModuleInit() {
    const client = this.getClient();
    if (!client) {
      this.logger.log(`Storage local en ${this.localRoot} (sin MINIO_ENDPOINT)`);
      await mkdir(this.localRoot, { recursive: true });
      return;
    }

    try {
      await client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    } catch {
      // bucket ya existe
    }
  }

  async ping(): Promise<boolean> {
    const client = this.getClient();
    if (!client) {
      try {
        await mkdir(this.localRoot, { recursive: true });
        return true;
      } catch {
        return false;
      }
    }
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: ".healthcheck",
          Body: "ok",
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  async subirArchivo(path: string, body: Buffer, contentType: string): Promise<void> {
    const client = this.getClient();
    if (!client) {
      const full = join(this.localRoot, path);
      await mkdir(dirname(full), { recursive: true });
      await writeFile(full, body);
      return;
    }

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: body,
        ContentType: contentType,
      })
    );
  }

  async leerArchivo(path: string): Promise<Buffer> {
    const client = this.getClient();
    if (!client) {
      const full = join(this.localRoot, path);
      await access(full, fsConstants.R_OK);
      return readFile(full);
    }

    const respuesta = await client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: path })
    );
    const bytes = await respuesta.Body?.transformToByteArray();
    if (!bytes) throw new Error("ARCHIVO_VACIO");
    return Buffer.from(bytes);
  }

  async urlFirmada(path: string, expiraSeg = 900): Promise<string> {
    const client = this.getClient();
    if (!client) {
      // El caller debe preferir streaming local vía admin.
      return `local://${path}`;
    }

    return getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: this.bucket, Key: path }),
      { expiresIn: expiraSeg }
    );
  }
}

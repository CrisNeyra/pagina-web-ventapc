import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize } from "node:path";

function raizUploads() {
  const carpeta = process.env.UPLOADS_DIR?.trim() || "uploads";
  return join(/*turbopackIgnore: true*/ process.cwd(), carpeta);
}

export function blobConfigurado(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export async function guardarArchivoCv(
  buffer: Buffer,
  pathRelativo: string
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (token) {
    const { put } = await import("@vercel/blob");
    const blob = await put(pathRelativo.replace(/\\/g, "/"), buffer, {
      access: "private",
      token,
      addRandomSuffix: false,
      contentType: "application/pdf",
    });
    return blob.url;
  }

  const absoluto = join(/*turbopackIgnore: true*/ raizUploads(), pathRelativo);
  await mkdir(/*turbopackIgnore: true*/ dirname(absoluto), { recursive: true });
  await writeFile(/*turbopackIgnore: true*/ absoluto, buffer);
  return pathRelativo;
}

export async function leerArchivoCv(cvPath: string): Promise<Buffer> {
  if (cvPath.startsWith("http://") || cvPath.startsWith("https://")) {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(cvPath, { headers, cache: "no-store" });
    if (!res.ok) throw new Error("CV_NO_DISPONIBLE");
    return Buffer.from(await res.arrayBuffer());
  }

  const root = raizUploads();
  const absoluto = isAbsolute(cvPath)
    ? normalize(cvPath)
    : join(/*turbopackIgnore: true*/ root, cvPath);
  if (!absoluto.startsWith(root)) {
    throw new Error("CV_PATH_INVALIDO");
  }
  return readFile(/*turbopackIgnore: true*/ absoluto);
}

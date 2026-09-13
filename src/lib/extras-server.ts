import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class ExtrasError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtrasError";
  }
}

export async function guardarPcBuild(opciones: {
  userId: string;
  subtotal: number;
  items: unknown;
}) {
  if (!Number.isFinite(opciones.subtotal) || opciones.subtotal < 0) {
    throw new ExtrasError("DATOS_INVALIDOS");
  }
  if (!Array.isArray(opciones.items)) {
    throw new ExtrasError("DATOS_INVALIDOS");
  }

  const build = await prisma.pcBuild.create({
    data: {
      userId: opciones.userId,
      subtotal: Math.round(opciones.subtotal),
      items: opciones.items as Prisma.InputJsonValue,
    },
  });

  return { id: build.id };
}

export async function listarPcBuildsUsuario(userId: string) {
  const builds = await prisma.pcBuild.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return builds.map((b) => ({
    id: b.id,
    subtotal: b.subtotal,
    items: b.items,
    createdAt: b.createdAt.toISOString(),
  }));
}

const MAX_CV_BYTES = 5 * 1024 * 1024;

function raizUploads() {
  return resolve(process.cwd(), process.env.UPLOADS_DIR?.trim() || "uploads");
}

function esPdf(buffer: Buffer) {
  return buffer.subarray(0, 4).toString("utf8") === "%PDF";
}

export async function crearPostulacion(opciones: {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  cvBuffer: Buffer;
  cvNombreOriginal: string;
}) {
  const nombre = opciones.nombre.trim();
  const email = opciones.email.trim().toLowerCase();
  const telefono = opciones.telefono.trim();
  const mensaje = opciones.mensaje.trim() || "";

  if (!nombre || !email || !telefono) {
    throw new ExtrasError("CAMPOS_REQUERIDOS");
  }

  if (opciones.cvBuffer.length > MAX_CV_BYTES) {
    throw new ExtrasError("CV_DEMASIADO_GRANDE");
  }
  if (!esPdf(opciones.cvBuffer)) {
    throw new ExtrasError("CV_INVALIDO");
  }

  const id = randomUUID();
  const cvNombre = opciones.cvNombreOriginal.replace(/[^\w.\- ()áéíóúÁÉÍÓÚñÑ]/g, "_") || "curriculum.pdf";
  const cvPath = `postulaciones/${id}/${cvNombre}`;
  const absoluto = resolve(raizUploads(), cvPath);

  await mkdir(dirname(absoluto), { recursive: true });
  await writeFile(absoluto, opciones.cvBuffer);

  const postulacion = await prisma.postulacion.create({
    data: {
      id,
      nombre,
      email,
      telefono,
      mensaje,
      cvPath,
      cvNombre,
    },
  });

  return {
    id: postulacion.id,
    nombre: postulacion.nombre,
    email: postulacion.email,
  };
}

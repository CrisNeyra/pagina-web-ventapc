import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { RedisService } from "../redis/redis.service";
import { EmailService } from "../email/email.service";

@Injectable()
export class PostulacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly redis: RedisService,
    private readonly email: EmailService
  ) {}

  async crear(
    datos: {
      nombre: string;
      email: string;
      telefono: string;
      mensaje: string;
      cv: Express.Multer.File;
    },
    ip?: string
  ) {
    if (ip) {
      const bloqueado = await this.redis.excedeRateLimit(`postulaciones:ip:${ip}`, 5);
      if (bloqueado) throw new ConflictException("RATE_LIMITED");
    }

    if (!datos.nombre || !datos.email || !datos.telefono) {
      throw new BadRequestException("CAMPOS_REQUERIDOS");
    }

    const buffer = datos.cv.buffer;
    if (buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException("CV_DEMASIADO_GRANDE");
    }
    if (!buffer.subarray(0, 4).toString().startsWith("%PDF")) {
      throw new BadRequestException("CV_INVALIDO");
    }

    const id = randomUUID();
    const cvNombre = datos.cv.originalname || "curriculum.pdf";
    const cvPath = `postulaciones/${id}/${cvNombre}`;

    await this.storage.subirArchivo(cvPath, buffer, "application/pdf");

    const postulacion = await this.prisma.postulacion.create({
      data: {
        id,
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        mensaje: datos.mensaje,
        cvPath,
        cvNombre,
      },
    });

    void this.email.confirmacionPostulacion({
      email: postulacion.email,
      nombre: postulacion.nombre,
      postulacionId: postulacion.id,
    });

    return postulacion;
  }

  async listarRecibidas() {
    return this.prisma.postulacion.findMany({
      where: { estado: "recibida" },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async obtenerCv(id: string) {
    const postulacion = await this.prisma.postulacion.findUnique({ where: { id } });
    if (!postulacion) throw new NotFoundException("POSTULACION_NO_ENCONTRADA");
    const buffer = await this.storage.leerArchivo(postulacion.cvPath);
    return { buffer, nombre: postulacion.cvNombre };
  }
}

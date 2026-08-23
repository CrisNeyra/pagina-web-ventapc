import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { PostulacionesService } from "./postulaciones.service";

@Controller("postulaciones")
export class PostulacionesController {
  constructor(private readonly postulacionesService: PostulacionesService) {}

  @Post()
  @UseInterceptors(FileInterceptor("cv"))
  crear(
    @UploadedFile() cv: Express.Multer.File,
    @Req() req: Request & { body: Record<string, string> }
  ) {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.socket.remoteAddress ??
      "unknown";

    return this.postulacionesService.crear(
      {
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.telefono,
        mensaje: req.body.mensaje ?? "",
        cv,
      },
      ip
    );
  }
}

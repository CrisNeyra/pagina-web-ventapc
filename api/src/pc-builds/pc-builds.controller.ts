import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("pc-builds")
export class PcBuildsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  guardar(
    @CurrentUser() user: { sub: string },
    @Body() body: { subtotal: number; items: unknown[] }
  ) {
    return this.prisma.pcBuild.create({
      data: {
        userId: user.sub,
        subtotal: body.subtotal,
        items: body.items as object,
      },
    });
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  listar(@CurrentUser() user: { sub: string }) {
    return this.prisma.pcBuild.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: "desc" },
    });
  }
}

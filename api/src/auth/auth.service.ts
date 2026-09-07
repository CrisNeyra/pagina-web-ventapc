import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  private firmarToken(user: { id: string; email: string; role: UserRole }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async registrar(email: string, password: string) {
    const existe = await this.prisma.user.findUnique({ where: { email } });
    if (existe) throw new ConflictException("EMAIL_YA_REGISTRADO");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, role: UserRole.user },
    });

    return {
      token: this.firmarToken(user),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) throw new UnauthorizedException("CREDENCIALES_INVALIDAS");

    const valido = await bcrypt.compare(password, user.passwordHash);
    if (!valido) throw new UnauthorizedException("CREDENCIALES_INVALIDAS");

    return {
      token: this.firmarToken(user),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("USUARIO_NO_ENCONTRADO");
    return { id: user.id, email: user.email, role: user.role };
  }
}

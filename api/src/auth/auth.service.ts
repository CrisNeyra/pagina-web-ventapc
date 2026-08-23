import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as admin from "firebase-admin";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  private firebaseApp: admin.app.App | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {
    const json =
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
    if (json && !admin.apps.length) {
      try {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(json) as admin.ServiceAccount),
        });
      } catch {
        this.firebaseApp = null;
      }
    }
  }

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

    return { token: this.firmarToken(user), user: { id: user.id, email: user.email, role: user.role } };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) throw new UnauthorizedException("CREDENCIALES_INVALIDAS");

    const valido = await bcrypt.compare(password, user.passwordHash);
    if (!valido) throw new UnauthorizedException("CREDENCIALES_INVALIDAS");

    return { token: this.firmarToken(user), user: { id: user.id, email: user.email, role: user.role } };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("USUARIO_NO_ENCONTRADO");
    return { id: user.id, email: user.email, role: user.role };
  }

  async intercambiarFirebase(idToken: string) {
    if (process.env.DISABLE_FIREBASE_EXCHANGE === "true") {
      throw new BadRequestException("FIREBASE_EXCHANGE_DESHABILITADO");
    }

    if (!this.firebaseApp) throw new BadRequestException("FIREBASE_NO_CONFIGURADO");

    const decoded = await admin.auth(this.firebaseApp).verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase();
    if (!email) throw new UnauthorizedException("EMAIL_REQUERIDO");

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid: decoded.uid }, { email }],
      },
    });

    const admins = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const esAdmin = admins.includes(email);

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firebaseUid: decoded.uid,
          role: esAdmin ? UserRole.admin : UserRole.user,
        },
      });
    } else if (!user.firebaseUid) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid: decoded.uid,
          role: esAdmin ? UserRole.admin : user.role,
        },
      });
    }

    return { token: this.firmarToken(user), user: { id: user.id, email: user.email, role: user.role } };
  }
}

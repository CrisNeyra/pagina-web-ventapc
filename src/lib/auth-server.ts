import { AURA_TOKEN_COOKIE } from "@/tipos/auth-user";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validarPassword } from "@/lib/auth";
import { expiracionJwt } from "@/lib/auth-cookie";
import { firmarTokenReset, huellaPassword, verificarTokenReset } from "@/lib/password-reset";

function jwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("Falta JWT_SECRET en el entorno (mismo valor que uses en producción).");
  }
  return new TextEncoder().encode(secret);
}

export function nombreCookieAuth(): string {
  return AURA_TOKEN_COOKIE;
}

export async function firmarToken(
  user: {
    id: string;
    email: string;
    role: UserRole;
  },
  expiresIn: "30d" | "7d" | "1d" = "7d"
): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(jwtSecret());
}

export async function verificarToken(
  token: string
): Promise<{ sub: string; email: string; role: UserRole } | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    const role = payload.role === UserRole.admin ? UserRole.admin : UserRole.user;
    return { sub: payload.sub, email: payload.email, role };
  } catch {
    return null;
  }
}

export async function registrarUsuario(email: string, password: string) {
  const normalizado = email.trim().toLowerCase();
  if (!normalizado || !validarPassword(password)) {
    throw new Error("DATOS_INVALIDOS");
  }

  const existe = await prisma.user.findUnique({ where: { email: normalizado } });
  if (existe) throw new Error("EMAIL_YA_REGISTRADO");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: normalizado, passwordHash, role: UserRole.user },
  });

  const token = await firmarToken(user);
  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

export async function loginUsuario(
  email: string,
  password: string,
  recordarme = false
) {
  const normalizado = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizado } });
  if (!user?.passwordHash) throw new Error("CREDENCIALES_INVALIDAS");

  const valido = await bcrypt.compare(password, user.passwordHash);
  if (!valido) throw new Error("CREDENCIALES_INVALIDAS");

  const token = await firmarToken(user, expiracionJwt(recordarme));
  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

export async function obtenerUsuarioPorId(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}

/** Bearer o cookie httpOnly `aura_token`. */
export async function obtenerUsuarioDesdeRequest(request: Request) {
  const header = request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const token = bearer ?? jar.get(nombreCookieAuth())?.value;
  if (!token) return null;

  const payload = await verificarToken(token);
  if (!payload) return null;

  return obtenerUsuarioPorId(payload.sub);
}

export async function solicitarRestablecerPassword(email: string) {
  const normalizado = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizado } });
  if (!user) return null;
  return firmarTokenReset(user);
}

export async function restablecerPassword(token: string, nueva: string) {
  if (!validarPassword(nueva)) throw new Error("DATOS_INVALIDOS");

  const payload = await verificarTokenReset(token);
  if (!payload) throw new Error("TOKEN_INVALIDO");

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || huellaPassword(user.passwordHash) !== payload.ph) {
    throw new Error("TOKEN_INVALIDO");
  }

  const passwordHash = await bcrypt.hash(nueva, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
}

export async function cambiarPasswordUsuario(
  userId: string,
  actual: string,
  nueva: string
) {
  if (!validarPassword(nueva)) throw new Error("DATOS_INVALIDOS");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash) throw new Error("CREDENCIALES_INVALIDAS");

  const valido = await bcrypt.compare(actual, user.passwordHash);
  if (!valido) throw new Error("CREDENCIALES_INVALIDAS");

  const passwordHash = await bcrypt.hash(nueva, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

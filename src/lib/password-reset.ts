import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

function jwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("Falta JWT_SECRET en el entorno (mismo valor que uses en producción).");
  }
  return new TextEncoder().encode(secret);
}

export function huellaPassword(passwordHash: string | null): string {
  return createHash("sha256")
    .update(passwordHash ?? "sin-password")
    .digest("hex")
    .slice(0, 16);
}

export async function firmarTokenReset(user: {
  id: string;
  passwordHash: string | null;
}): Promise<string> {
  return new SignJWT({
    purpose: "password-reset",
    ph: huellaPassword(user.passwordHash),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(jwtSecret());
}

export async function verificarTokenReset(
  token: string
): Promise<{ sub: string; ph: string } | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    if (payload.purpose !== "password-reset") return null;
    if (!payload.sub || typeof payload.ph !== "string") return null;
    return { sub: payload.sub, ph: payload.ph };
  } catch {
    return null;
  }
}

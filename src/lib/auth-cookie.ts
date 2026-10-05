import { AURA_TOKEN_COOKIE } from "@/tipos/auth-user";

export const SESION_RECORDAR_SEG = 60 * 60 * 24 * 30;
export const SESION_CORTA_SEG = 60 * 60 * 24;

export function expiracionJwt(recordarme: boolean): "30d" | "1d" {
  return recordarme ? "30d" : "1d";
}

/** Segundos restantes según el claim `exp` del JWT (sin verificar firma). */
export function maxAgeDesdeToken(token: string): number {
  try {
    const parte = token.split(".")[1];
    if (!parte) return SESION_CORTA_SEG;
    const json = JSON.parse(
      Buffer.from(parte, "base64url").toString("utf8")
    ) as { exp?: number };
    if (!json.exp) return SESION_CORTA_SEG;
    return Math.max(60, json.exp - Math.floor(Date.now() / 1000));
  } catch {
    return SESION_CORTA_SEG;
  }
}

export function opcionesCookieAuth(token: string) {
  return {
    name: AURA_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeDesdeToken(token),
  };
}

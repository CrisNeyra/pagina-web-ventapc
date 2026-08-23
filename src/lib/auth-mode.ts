/** Modo de autenticación del frontend. */
export type AuthMode = "firebase" | "nest";

/**
 * `nest` = register/login JWT Nest (Fase B, default si hay API).
 * `firebase` = Firebase Auth + exchange a JWT (Fase A / legado).
 */
export function obtenerAuthMode(): AuthMode {
  const mode = process.env.NEXT_PUBLIC_AUTH_MODE?.trim().toLowerCase();
  if (mode === "firebase") return "firebase";
  if (mode === "nest") return "nest";
  return process.env.NEXT_PUBLIC_API_URL?.trim() ? "nest" : "firebase";
}

export function authModeEsNest(): boolean {
  return obtenerAuthMode() === "nest";
}

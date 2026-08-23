const API_TOKEN_KEY = "aura-pro-api-token";

export function guardarApiToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(API_TOKEN_KEY, token);
}

export function obtenerApiToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(API_TOKEN_KEY);
}

export function limpiarApiToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(API_TOKEN_KEY);
}

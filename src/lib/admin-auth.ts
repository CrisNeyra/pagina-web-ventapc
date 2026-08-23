import { obtenerFirebaseAuthAdmin } from "@/lib/firebase-admin";
import { obtenerApiUrl } from "@/lib/api-client";

export function obtenerEmailsAdmin(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function verificarJwtNest(
  token: string
): Promise<{ ok: true; email: string; uid: string } | { ok: false; status: number }> {
  try {
    const respuesta = await fetch(`${obtenerApiUrl()}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (respuesta.status === 401) return { ok: false, status: 401 };
    if (!respuesta.ok) return { ok: false, status: 503 };

    const user = (await respuesta.json()) as {
      id: string;
      email: string;
      role: string;
    };

    const admins = obtenerEmailsAdmin();
    const esAdmin =
      user.role === "admin" || admins.includes(user.email.toLowerCase());

    if (!esAdmin) return { ok: false, status: 403 };

    return { ok: true, email: user.email, uid: user.id };
  } catch {
    return { ok: false, status: 503 };
  }
}

/**
 * Acepta Bearer Firebase idToken (legado) o JWT Nest (API).
 */
export async function verificarAdminRequest(
  request: Request
): Promise<{ ok: true; email: string; uid: string } | { ok: false; status: number }> {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return { ok: false, status: 401 };
  }

  const token = authorization.slice("Bearer ".length);

  if (process.env.NEXT_PUBLIC_API_URL?.trim()) {
    const nest = await verificarJwtNest(token);
    if (nest.ok || nest.status === 403 || nest.status === 401) {
      return nest;
    }
  }

  const admins = obtenerEmailsAdmin();
  if (admins.length === 0) {
    return { ok: false, status: 503 };
  }

  const auth = obtenerFirebaseAuthAdmin();
  if (!auth) {
    return { ok: false, status: 503 };
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase();

    if (!email || !admins.includes(email)) {
      return { ok: false, status: 403 };
    }

    return { ok: true, email, uid: decoded.uid };
  } catch {
    return { ok: false, status: 401 };
  }
}

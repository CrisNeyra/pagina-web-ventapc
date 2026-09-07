import { obtenerApiUrl } from "@/lib/api-client";

export function obtenerEmailsAdmin(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Verifica Bearer JWT Nest + rol admin (o email en ADMIN_EMAILS).
 */
export async function verificarAdminRequest(
  request: Request
): Promise<{ ok: true; email: string; uid: string } | { ok: false; status: number }> {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return { ok: false, status: 401 };
  }

  if (!process.env.NEXT_PUBLIC_API_URL?.trim()) {
    return { ok: false, status: 503 };
  }

  const token = authorization.slice("Bearer ".length);

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

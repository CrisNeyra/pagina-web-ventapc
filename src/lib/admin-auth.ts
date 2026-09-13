import { UserRole } from "@prisma/client";
import { apiConfigurada } from "@/lib/api-client";
import { obtenerUsuarioDesdeRequest } from "@/lib/auth-server";

export function obtenerEmailsAdmin(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Verifica Bearer/cookie JWT + rol admin (o email en ADMIN_EMAILS).
 */
export async function verificarAdminRequest(
  request: Request
): Promise<{ ok: true; email: string; uid: string } | { ok: false; status: number }> {
  if (!apiConfigurada()) {
    return { ok: false, status: 503 };
  }

  const user = await obtenerUsuarioDesdeRequest(request);
  if (!user) {
    return { ok: false, status: 401 };
  }

  const admins = obtenerEmailsAdmin();
  const esAdmin =
    user.role === UserRole.admin || admins.includes(user.email.toLowerCase());

  if (!esAdmin) {
    return { ok: false, status: 403 };
  }

  return { ok: true, email: user.email, uid: user.id };
}

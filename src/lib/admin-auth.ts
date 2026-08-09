import { obtenerFirebaseAuthAdmin } from "@/lib/firebase-admin";

export function obtenerEmailsAdmin(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function verificarAdminRequest(
  request: Request
): Promise<{ ok: true; email: string; uid: string } | { ok: false; status: number }> {
  const admins = obtenerEmailsAdmin();
  if (admins.length === 0) {
    return { ok: false, status: 503 };
  }

  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return { ok: false, status: 401 };
  }

  const auth = obtenerFirebaseAuthAdmin();
  if (!auth) {
    return { ok: false, status: 503 };
  }

  try {
    const idToken = authorization.slice("Bearer ".length);
    const decoded = await auth.verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase();

    if (!email || !admins.includes(email)) {
      return { ok: false, status: 403 };
    }

    return { ok: true, email, uid: decoded.uid };
  } catch {
    return { ok: false, status: 401 };
  }
}

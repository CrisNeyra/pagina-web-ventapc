import { UserRole } from "@prisma/client";
import { firmarToken } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const OAUTH_STATE_COOKIE = "aura_oauth_state";

export function googleConfigurado(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}

/** Origen real de la visita (localhost en dev, dominio público en Vercel). */
export function origenPublico(request: Request): string {
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (host) {
    const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

export function urlCallbackGoogle(request: Request): string {
  return `${origenPublico(request)}/api/auth/google/callback`;
}

export function urlAutorizacionGoogle(request: Request, state: string): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!.trim());
  url.searchParams.set("redirect_uri", urlCallbackGoogle(request));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function intercambiarCodigoGoogle(
  request: Request,
  code: string
): Promise<{ email: string }> {
  const cuerpo = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!.trim(),
    client_secret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
    redirect_uri: urlCallbackGoogle(request),
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: cuerpo,
  });
  if (!tokenRes.ok) {
    throw new Error("GOOGLE_TOKEN");
  }

  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("GOOGLE_TOKEN");

  const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) throw new Error("GOOGLE_USERINFO");

  const info = (await infoRes.json()) as {
    email?: string;
    verified_email?: boolean;
  };
  const email = info.email?.trim().toLowerCase();
  if (!email || info.verified_email === false) {
    throw new Error("GOOGLE_EMAIL");
  }
  return { email };
}

export async function usuarioDesdeGoogle(email: string) {
  const existente = await prisma.user.findUnique({ where: { email } });
  const user =
    existente ??
    (await prisma.user.create({
      data: { email, role: UserRole.user },
    }));

  const token = await firmarToken(user, "30d");
  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

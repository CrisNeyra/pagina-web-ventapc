import { NextRequest, NextResponse } from "next/server";
import { obtenerFirebaseAuthAdmin } from "@/lib/firebase-admin";

const COOKIE_SESION = "__session";
const MAX_AGE_SEGUNDOS = 60 * 60 * 24 * 5;

export async function POST(request: NextRequest) {
  const auth = obtenerFirebaseAuthAdmin();
  if (!auth) {
    return NextResponse.json(
      { error: "FIREBASE_ADMIN_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  try {
    const { idToken } = (await request.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: "MISSING_ID_TOKEN" }, { status: 400 });
    }

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: MAX_AGE_SEGUNDOS * 1000,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: COOKIE_SESION,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SEGUNDOS,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "INVALID_ID_TOKEN" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: COOKIE_SESION,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

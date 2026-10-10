import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  databaseUrlConfigurada: () => true,
}));

vi.mock("@/lib/rate-limit", () => ({
  claveRateLimit: () => "login:test",
  limitarPeticion: vi.fn(async () => ({ ok: true })),
  respuestaRateLimit: () => ({ body: { message: "RATE_LIMITED" }, init: { status: 429 } }),
}));

vi.mock("@/lib/auth-server", () => ({
  loginUsuario: vi.fn(async () => ({
    token: "jwt-secreto",
    user: { id: "u1", email: "a@b.c", role: "user" },
  })),
}));

vi.mock("@/lib/auth-cookie", () => ({
  opcionesCookieAuth: (token: string) => ({
    name: "aura_token",
    value: token,
    httpOnly: true,
    path: "/",
  }),
}));

import { POST } from "@/app/api/auth/login/route";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deja el JWT solo en la cookie", async () => {
    const respuesta = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@aurapro.com", password: "secreta123" }),
      })
    );

    const cuerpo = (await respuesta.json()) as { token?: string; user?: { email: string } };
    expect(respuesta.status).toBe(200);
    expect(cuerpo.token).toBeUndefined();
    expect(cuerpo.user?.email).toBe("a@b.c");
    expect(respuesta.headers.get("set-cookie")).toContain("aura_token=");
    expect(respuesta.headers.get("set-cookie")).not.toContain("jwt-secreto-en-json");
    expect(respuesta.headers.get("set-cookie")).toContain("jwt-secreto");
  });
});

import { test, expect } from "@playwright/test";

/**
 * Smoke de Route Handlers Next (`/api`).
 * Se skippea si /api/health no responde ok (CI sin DATABASE_URL).
 */
test.describe("API Next: health + productos + auth", () => {
  test("health, catálogo y registro/login", async ({ request }) => {
    const health = await request.get("/api/health");
    if (!health.ok()) {
      test.skip(true, "API Next no disponible (¿falta DATABASE_URL?)");
    }
    const body = (await health.json()) as { ok?: boolean; mode?: string };
    if (!body.ok || body.mode !== "next-prisma") {
      test.skip(true, "Health no está en mode next-prisma");
    }

    const productos = await request.get("/api/products");
    expect(productos.ok()).toBeTruthy();
    const listaJson = (await productos.json()) as { productos?: { id: string }[] };
    expect(Array.isArray(listaJson.productos)).toBeTruthy();

    const email = `e2e_${Date.now()}@aurapro.test`;
    const password = "AuraPro2026x";

    const registro = await request.post("/api/auth/register", {
      data: { email, password },
    });
    expect([200, 201]).toContain(registro.status());
    const regBody = (await registro.json()) as { token?: string; user?: { email: string } };
    expect(regBody.token).toBeUndefined();
    expect(regBody.user?.email).toBe(email);

    const login = await request.post("/api/auth/login", {
      data: { email, password },
    });
    expect(login.ok()).toBeTruthy();
    const loginBody = (await login.json()) as { token?: string };
    expect(loginBody.token).toBeUndefined();

    const me = await request.get("/api/auth/me");
    expect(me.ok()).toBeTruthy();
  });
});

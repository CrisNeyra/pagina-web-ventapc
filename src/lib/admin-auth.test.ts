import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const verifyIdToken = vi.fn();

vi.mock("@/lib/firebase-admin", () => ({
  obtenerFirebaseAuthAdmin: vi.fn(() => ({
    verifyIdToken,
  })),
}));

import { obtenerEmailsAdmin, verificarAdminRequest } from "./admin-auth";

describe("obtenerEmailsAdmin", () => {
  const original = process.env.ADMIN_EMAILS;

  afterEach(() => {
    process.env.ADMIN_EMAILS = original;
  });

  it("parsea emails separados por coma", () => {
    process.env.ADMIN_EMAILS = "Admin@AuraPro.com, soporte@aurapro.com ";
    expect(obtenerEmailsAdmin()).toEqual([
      "admin@aurapro.com",
      "soporte@aurapro.com",
    ]);
  });

  it("devuelve array vacío sin variable", () => {
    delete process.env.ADMIN_EMAILS;
    expect(obtenerEmailsAdmin()).toEqual([]);
  });
});

describe("verificarAdminRequest", () => {
  const original = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAILS = "admin@aurapro.com";
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = original;
  });

  it("rechaza si no hay admins configurados", async () => {
    delete process.env.ADMIN_EMAILS;

    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/pedidos")
    );

    expect(resultado).toEqual({ ok: false, status: 503 });
  });

  it("rechaza sin header Authorization", async () => {
    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/pedidos")
    );

    expect(resultado).toEqual({ ok: false, status: 401 });
  });

  it("rechaza token de usuario no admin", async () => {
    verifyIdToken.mockResolvedValue({
      uid: "user-1",
      email: "cliente@test.com",
    });

    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/pedidos", {
        headers: { authorization: "Bearer token-valido" },
      })
    );

    expect(resultado).toEqual({ ok: false, status: 403 });
  });

  it("acepta token de admin", async () => {
    verifyIdToken.mockResolvedValue({
      uid: "admin-1",
      email: "admin@aurapro.com",
    });

    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/pedidos", {
        headers: { authorization: "Bearer token-valido" },
      })
    );

    expect(resultado).toEqual({
      ok: true,
      email: "admin@aurapro.com",
      uid: "admin-1",
    });
  });
});

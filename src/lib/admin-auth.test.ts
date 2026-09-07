import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

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
  const originalEmails = process.env.ADMIN_EMAILS;
  const originalApi = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAILS = "admin@aurapro.com";
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000/api";
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalEmails;
    process.env.NEXT_PUBLIC_API_URL = originalApi;
  });

  it("rechaza sin API configurada", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/pedidos", {
        headers: { authorization: "Bearer token" },
      })
    );

    expect(resultado).toEqual({ ok: false, status: 503 });
  });

  it("rechaza sin header Authorization", async () => {
    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/pedidos")
    );

    expect(resultado).toEqual({ ok: false, status: 401 });
  });

  it("rechaza usuario no admin", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "user-1",
        email: "cliente@test.com",
        role: "user",
      }),
    });

    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/pedidos", {
        headers: { authorization: "Bearer token-valido" },
      })
    );

    expect(resultado).toEqual({ ok: false, status: 403 });
  });

  it("acepta admin por rol", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "admin-1",
        email: "otro@test.com",
        role: "admin",
      }),
    });

    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/pedidos", {
        headers: { authorization: "Bearer token-valido" },
      })
    );

    expect(resultado).toEqual({
      ok: true,
      email: "otro@test.com",
      uid: "admin-1",
    });
  });
});

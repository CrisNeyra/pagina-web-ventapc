import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UserRole } from "@prisma/client";

vi.mock("@/lib/auth-server", () => ({
  obtenerUsuarioDesdeRequest: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  apiConfigurada: vi.fn(),
}));

import { obtenerEmailsAdmin, verificarAdminRequest } from "./admin-auth";
import { obtenerUsuarioDesdeRequest } from "@/lib/auth-server";
import { apiConfigurada } from "@/lib/api-client";

const obtenerUsuarioMock = vi.mocked(obtenerUsuarioDesdeRequest);
const apiConfiguradaMock = vi.mocked(apiConfigurada);

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

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAILS = "admin@aurapro.com";
    apiConfiguradaMock.mockReturnValue(true);
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalEmails;
  });

  it("rechaza si la API no está configurada", async () => {
    apiConfiguradaMock.mockReturnValue(false);
    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/orders", {
        headers: { authorization: "Bearer token" },
      })
    );
    expect(resultado).toEqual({ ok: false, status: 503 });
  });

  it("rechaza sin usuario autenticado", async () => {
    obtenerUsuarioMock.mockResolvedValue(null);
    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/orders")
    );
    expect(resultado).toEqual({ ok: false, status: 401 });
  });

  it("rechaza usuario no admin", async () => {
    obtenerUsuarioMock.mockResolvedValue({
      id: "user-1",
      email: "cliente@test.com",
      role: UserRole.user,
    });

    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/orders", {
        headers: { authorization: "Bearer token-valido" },
      })
    );

    expect(resultado).toEqual({ ok: false, status: 403 });
  });

  it("acepta admin por rol", async () => {
    obtenerUsuarioMock.mockResolvedValue({
      id: "admin-1",
      email: "otro@test.com",
      role: UserRole.admin,
    });

    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/orders", {
        headers: { authorization: "Bearer token-valido" },
      })
    );

    expect(resultado).toEqual({
      ok: true,
      email: "otro@test.com",
      uid: "admin-1",
    });
  });

  it("acepta admin por ADMIN_EMAILS", async () => {
    obtenerUsuarioMock.mockResolvedValue({
      id: "user-2",
      email: "admin@aurapro.com",
      role: UserRole.user,
    });

    const resultado = await verificarAdminRequest(
      new Request("http://localhost/api/admin/orders", {
        headers: { authorization: "Bearer token-valido" },
      })
    );

    expect(resultado).toEqual({
      ok: true,
      email: "admin@aurapro.com",
      uid: "user-2",
    });
  });
});

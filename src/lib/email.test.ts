import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  emailConfigurado,
  enviarEmail,
  enviarEmailConfirmacionPedido,
  enviarEmailConfirmacionPostulacion,
} from "./email";

describe("email", () => {
  const original = { ...process.env };
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...original };
  });

  describe("emailConfigurado", () => {
    it("devuelve false sin variables de entorno", () => {
      delete process.env.RESEND_API_KEY;
      delete process.env.EMAIL_FROM;
      expect(emailConfigurado()).toBe(false);
    });

    it("devuelve true con RESEND_API_KEY y EMAIL_FROM", () => {
      process.env.RESEND_API_KEY = "re_test";
      process.env.EMAIL_FROM = "Aura Pro <test@example.com>";
      expect(emailConfigurado()).toBe(true);
    });
  });

  describe("enviarEmail", () => {
    it("no envía si falta configuración", async () => {
      delete process.env.RESEND_API_KEY;
      delete process.env.EMAIL_FROM;

      const resultado = await enviarEmail({
        to: "user@test.com",
        subject: "Test",
        html: "<p>Hola</p>",
      });

      expect(resultado).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("envía a la API de Resend cuando está configurado", async () => {
      process.env.RESEND_API_KEY = "re_test";
      process.env.EMAIL_FROM = "Aura Pro <test@example.com>";

      const resultado = await enviarEmail({
        to: "user@test.com",
        subject: "Test",
        html: "<p>Hola</p>",
      });

      expect(resultado).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("enviarEmailConfirmacionPedido", () => {
    it("incluye datos del pedido en el asunto", async () => {
      process.env.RESEND_API_KEY = "re_test";
      process.env.EMAIL_FROM = "Aura Pro <test@example.com>";

      await enviarEmailConfirmacionPedido({
        email: "cliente@test.com",
        orderId: "abc12345-uuid",
        metodoPago: "Efectivo en el local",
        total: 150000,
      });

      const body = JSON.parse(String(fetchMock.mock.calls.at(-1)?.[1]?.body)) as {
        subject: string;
        to: string;
      };

      expect(body.to).toBe("cliente@test.com");
      expect(body.subject).toContain("abc12345");
    });
  });

  describe("enviarEmailConfirmacionPostulacion", () => {
    it("envía confirmación al postulante", async () => {
      process.env.RESEND_API_KEY = "re_test";
      process.env.EMAIL_FROM = "Aura Pro <test@example.com>";

      const resultado = await enviarEmailConfirmacionPostulacion({
        email: "postulante@test.com",
        nombre: "Juan",
        postulacionId: "post-12345",
      });

      expect(resultado).toBe(true);
      expect(fetchMock).toHaveBeenCalledOnce();
    });
  });
});

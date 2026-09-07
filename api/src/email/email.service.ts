import { Injectable, Logger } from "@nestjs/common";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  configurado(): boolean {
    return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
  }

  async enviar(payload: EmailPayload): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.EMAIL_FROM?.trim();
    if (!apiKey || !from) {
      this.logger.debug(`Email omitido (sin RESEND): ${payload.subject} → ${payload.to}`);
      return false;
    }

    try {
      const respuesta = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        }),
      });
      if (!respuesta.ok) {
        this.logger.warn(`Resend HTTP ${respuesta.status} para ${payload.to}`);
      }
      return respuesta.ok;
    } catch (error) {
      this.logger.warn(`Resend error: ${error instanceof Error ? error.message : error}`);
      return false;
    }
  }

  async confirmacionPedido(opciones: {
    email: string;
    orderId: string;
    metodoPago: string;
    total: number;
  }) {
    const totalFormateado = opciones.total.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });
    const site = process.env.PUBLIC_SITE_URL?.trim() || "https://pagina-web-ventapc.vercel.app";

    return this.enviar({
      to: opciones.email,
      subject: `Pedido confirmado #${opciones.orderId.slice(0, 8)} — Aura Pro`,
      html: `
        <h2>¡Gracias por tu compra!</h2>
        <p>Tu pedido <strong>${opciones.orderId}</strong> fue registrado correctamente.</p>
        <ul>
          <li><strong>Método de pago:</strong> ${opciones.metodoPago}</li>
          <li><strong>Total:</strong> ${totalFormateado}</li>
        </ul>
        <p>Podés ver el estado en tu <a href="${site}/usuario">área de usuario</a>.</p>
      `,
    });
  }

  async confirmacionPostulacion(opciones: {
    email: string;
    nombre: string;
    postulacionId: string;
  }) {
    return this.enviar({
      to: opciones.email,
      subject: "Recibimos tu postulación — Aura Pro",
      html: `
        <h2>¡Hola ${opciones.nombre}!</h2>
        <p>Recibimos tu postulación (ref. <strong>${opciones.postulacionId.slice(0, 8)}</strong>).</p>
        <p>Nuestro equipo la revisará y te contactaremos a la brevedad.</p>
      `,
    });
  }

  async notificarAdminPedido(opciones: {
    orderId: string;
    email: string;
    metodoPago: string;
  }) {
    const admins = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (admins.length === 0) return;

    await Promise.all(
      admins.map((admin) =>
        this.enviar({
          to: admin,
          subject: `Nuevo pedido ${opciones.orderId.slice(0, 8)}`,
          html: `<p>Nuevo pedido de <strong>${opciones.email}</strong> vía ${opciones.metodoPago}.</p>`,
        })
      )
    );
  }
}

export function emailConfigurado() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

async function enviarEmail(opciones: { to: string; subject: string; html: string }) {
  if (!emailConfigurado()) return { enviado: false as const };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM!.trim(),
        to: [opciones.to],
        subject: opciones.subject,
        html: opciones.html,
      }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text().catch(() => ""));
      return { enviado: false as const };
    }
    return { enviado: true as const };
  } catch (error) {
    console.error("Resend exception", error);
    return { enviado: false as const };
  }
}

export async function notificarPedidoCreado(opciones: {
  email: string;
  orderId: string;
  totalPesos: number;
  estado: string;
}) {
  return enviarEmail({
    to: opciones.email,
    subject: `Aura Pro — pedido ${opciones.orderId.slice(0, 8)}`,
    html: `<p>Recibimos tu pedido <strong>${opciones.orderId}</strong>.</p>
<p>Total: $${opciones.totalPesos.toLocaleString("es-AR")} · Estado: ${opciones.estado}.</p>
<p>Gracias por comprar en Aura Pro.</p>`,
  });
}

export async function notificarRestablecerPassword(opciones: {
  email: string;
  enlace: string;
}) {
  return enviarEmail({
    to: opciones.email,
    subject: "Aura Pro — restablecé tu contraseña",
    html: `<p>Pediste restablecer la contraseña de Aura Pro.</p>
<p><a href="${opciones.enlace}">Elegí una contraseña nueva</a>. El enlace vence en 30 minutos.</p>
<p>Si no fuiste vos, ignorá este mensaje.</p>`,
  });
}

export async function notificarPostulacion(opciones: { email: string; nombre: string }) {
  return enviarEmail({
    to: opciones.email,
    subject: "Aura Pro — recibimos tu postulación",
    html: `<p>Hola ${opciones.nombre},</p>
<p>Recibimos tu CV. Te contactamos si hay novedades.</p>`,
  });
}

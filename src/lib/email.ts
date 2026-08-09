interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export function emailConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

export async function enviarEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) return false;

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

    return respuesta.ok;
  } catch {
    return false;
  }
}

export async function enviarEmailConfirmacionPedido(opciones: {
  email: string;
  orderId: string;
  metodoPago: string;
  total: number;
}): Promise<boolean> {
  const totalFormateado = opciones.total.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

  return enviarEmail({
    to: opciones.email,
    subject: `Pedido confirmado #${opciones.orderId.slice(0, 8)} — Aura Pro`,
    html: `
      <h2>¡Gracias por tu compra!</h2>
      <p>Tu pedido <strong>${opciones.orderId}</strong> fue registrado correctamente.</p>
      <ul>
        <li><strong>Método de pago:</strong> ${opciones.metodoPago}</li>
        <li><strong>Total:</strong> ${totalFormateado}</li>
      </ul>
      <p>Podés ver el estado en tu <a href="https://pagina-web-ventapc.vercel.app/usuario">área de usuario</a>.</p>
    `,
  });
}

export async function enviarEmailConfirmacionPostulacion(opciones: {
  email: string;
  nombre: string;
  postulacionId: string;
}): Promise<boolean> {
  return enviarEmail({
    to: opciones.email,
    subject: "Recibimos tu postulación — Aura Pro",
    html: `
      <h2>¡Hola ${opciones.nombre}!</h2>
      <p>Recibimos tu postulación (ref. <strong>${opciones.postulacionId.slice(0, 8)}</strong>).</p>
      <p>Nuestro equipo de RRHH la revisará y te contactaremos a la brevedad.</p>
    `,
  });
}

export async function notificarAdminNuevoPedido(opciones: {
  orderId: string;
  email: string;
  metodoPago: string;
}): Promise<void> {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (admins.length === 0) return;

  await Promise.all(
    admins.map((admin) =>
      enviarEmail({
        to: admin,
        subject: `Nuevo pedido ${opciones.orderId.slice(0, 8)}`,
        html: `<p>Nuevo pedido de <strong>${opciones.email}</strong> vía ${opciones.metodoPago}.</p>`,
      })
    )
  );
}

import { apiConfigurada, apiFetch } from "@/lib/api-client";
import type { DatosEntrega } from "@/lib/entrega";

export function pedidosApiConfigurados(): boolean {
  return apiConfigurada();
}

export async function crearPedidoEnApi(
  items: { id: string; precio: number; cantidad: number; nombre?: string }[],
  metodoPago: string,
  entrega: DatosEntrega,
  token: string,
  idempotencyKey?: string
) {
  return apiFetch<{ id: string; totalPesos: number; metodoPago: string }>("/orders", {
    method: "POST",
    token,
    headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
    body: JSON.stringify({ items, metodoPago, entrega }),
  });
}

export async function crearPaymentIntentEnApi(
  items: { id: string; precio: number; cantidad: number }[],
  token: string,
  opciones: {
    metodoPago: "debito" | "credito";
    cuotas?: number;
    entrega: DatosEntrega;
  }
) {
  return apiFetch<{
    orderId: string;
    paymentIntentId: string;
    clientSecret: string;
    totalPesos: number;
  }>("/payments/stripe/intent", {
    method: "POST",
    token,
    body: JSON.stringify({
      items,
      metodoPago: opciones.metodoPago,
      cuotas: opciones.cuotas,
      entrega: opciones.entrega,
    }),
  });
}

export async function obtenerPedidosUsuarioApi(token: string) {
  return apiFetch<
    {
      id: string;
      estado: string;
      totalPesos: number;
      metodoPago: string | null;
      createdAt: string;
      items: { nombre: string; cantidad: number; precioUnitario: number }[];
    }[]
  >("/orders/me", { token });
}

export async function cotizarEnvioApi(codigoPostal: string) {
  return apiFetch<{ costo: number; zona: string }>(
    `/shipping/quote?cp=${encodeURIComponent(codigoPostal)}`
  );
}

export async function obtenerTransferenciaApi() {
  return apiFetch<{
    banco: string;
    titular: string;
    cbu: string;
    alias: string;
  }>("/site-config/transferencia");
}

export async function intercambiarTokenFirebase(idToken: string) {
  return apiFetch<{ token: string; user: { id: string; email: string; role: string } }>(
    "/auth/firebase-exchange",
    { method: "POST", body: JSON.stringify({ idToken }) }
  );
}

export async function registrarUsuarioApi(email: string, password: string) {
  return apiFetch<{ token: string; user: { id: string; email: string; role: string } }>(
    "/auth/register",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
}

export async function loginUsuarioApi(email: string, password: string) {
  return apiFetch<{ token: string; user: { id: string; email: string; role: string } }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
}

export async function obtenerUsuarioApi(token: string) {
  return apiFetch<{ id: string; email: string; role: string }>("/auth/me", { token });
}

export async function obtenerPedidosAdminApi(token: string) {
  return apiFetch<
    {
      id: string;
      email: string | null;
      estado: string;
      metodoPago: string | null;
      totalPesos: number;
      createdAt: string;
    }[]
  >("/admin/orders", { token });
}

export async function actualizarPedidoAdminApi(
  token: string,
  orderId: string,
  estado: string
) {
  return apiFetch(`/admin/orders/${orderId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ estado }),
  });
}

export async function obtenerPostulacionesAdminApi(token: string) {
  return apiFetch<
    {
      id: string;
      nombre: string;
      email: string;
      telefono: string;
      cvNombre: string;
      createdAt: string;
    }[]
  >("/admin/postulaciones", { token });
}

export async function obtenerCvAdminApi(token: string, postulacionId: string) {
  return apiFetch<{ url: string }>(`/admin/postulaciones/${postulacionId}/cv`, { token });
}

export async function enviarPostulacionApi(formData: FormData) {
  const url = `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api"}/postulaciones`;
  const respuesta = await fetch(url, { method: "POST", body: formData });
  if (!respuesta.ok) {
    const datos = (await respuesta.json().catch(() => ({}))) as { message?: string };
    throw new Error(datos.message ?? "ERROR_POSTULACION");
  }
  return respuesta.json();
}

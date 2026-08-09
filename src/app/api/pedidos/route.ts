import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  firebaseAdminConfigurado,
  obtenerFirebaseAuthAdmin,
  obtenerFirestoreAdmin,
} from "@/lib/firebase-admin";
import { validarItemsContraCatalogo } from "@/lib/validarItemsPago";
import { calcularTotalCheckout, estadoPedidoPorMetodo } from "@/lib/checkout";
import { excedeRateLimit, obtenerIpCliente } from "@/lib/rate-limit";
import {
  enviarEmailConfirmacionPedido,
  notificarAdminNuevoPedido,
} from "@/lib/email";
import { etiquetaMetodoPago } from "@/servicios/pedidosServicio";
import type { MetodoPago } from "@/tipos/metodoPago";
import { preciosCatalogo } from "@/datos/preciosCatalogo";

interface ItemPedidoRequest {
  id: string;
  precio: number;
  cantidad: number;
  nombre?: string;
}

const METODOS_OFFLINE: MetodoPago[] = ["efectivo", "transferencia"];

export async function POST(request: NextRequest) {
  const ip = obtenerIpCliente(request);
  if (excedeRateLimit(`pedidos:ip:${ip}`)) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  if (!firebaseAdminConfigurado()) {
    return NextResponse.json({ error: "PEDIDOS_NO_CONFIGURADOS" }, { status: 503 });
  }

  const auth = obtenerFirebaseAuthAdmin();
  const db = obtenerFirestoreAdmin();
  if (!auth || !db) {
    return NextResponse.json({ error: "FIREBASE_ADMIN_ERROR" }, { status: 503 });
  }

  try {
    const authorization = request.headers.get("authorization") ?? "";
    if (!authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const idToken = authorization.slice("Bearer ".length);
    const decoded = await auth.verifyIdToken(idToken);

    if (excedeRateLimit(`pedidos:uid:${decoded.uid}`)) {
      return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
    }

    const body = (await request.json()) as {
      items?: ItemPedidoRequest[];
      metodoPago?: MetodoPago;
      cuotas?: number;
    };

    const metodoPago = body.metodoPago;
    if (!metodoPago || !METODOS_OFFLINE.includes(metodoPago)) {
      return NextResponse.json({ error: "METODO_PAGO_INVALIDO" }, { status: 400 });
    }

    const items = body.items ?? [];
    const validacion = validarItemsContraCatalogo(items, preciosCatalogo);
    if (!validacion.ok) {
      return NextResponse.json({ error: validacion.error }, { status: 400 });
    }

    const total = calcularTotalCheckout(items, metodoPago);
    if (total <= 0) {
      return NextResponse.json({ error: "INVALID_AMOUNT" }, { status: 400 });
    }

    const orderId = randomUUID();
    await db.collection("pedidos").doc(orderId).set({
      uid: decoded.uid,
      email: decoded.email ?? null,
      estado: estadoPedidoPorMetodo(metodoPago),
      metodoPago,
      amount: total,
      currency: "ars",
      items,
      cuotas: metodoPago === "credito" ? body.cuotas ?? 1 : null,
      createdAt: new Date(),
    });

    if (decoded.email) {
      void enviarEmailConfirmacionPedido({
        email: decoded.email,
        orderId,
        metodoPago: etiquetaMetodoPago(metodoPago),
        total,
      });
      void notificarAdminNuevoPedido({
        orderId,
        email: decoded.email,
        metodoPago: etiquetaMetodoPago(metodoPago),
      });
    }

    return NextResponse.json({ ok: true, orderId, total, metodoPago });
  } catch {
    return NextResponse.json({ error: "ERROR_INTERNO" }, { status: 500 });
  }
}

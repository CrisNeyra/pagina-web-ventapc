import { NextResponse } from "next/server";
import { obtenerFirestoreAdmin } from "@/lib/firebase-admin";
import { verificarAdminRequest } from "@/lib/admin-auth";
import { montoPedidoEnPesos } from "@/servicios/pedidosServicio";

const ESTADOS_PENDIENTES = new Set([
  "pending_payment",
  "pending_cash",
  "pending_transfer",
]);

export async function GET(request: Request) {
  const admin = await verificarAdminRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: admin.status });
  }

  const db = obtenerFirestoreAdmin();
  if (!db) {
    return NextResponse.json({ error: "FIREBASE_ADMIN_ERROR" }, { status: 503 });
  }

  try {
    const snapshot = await db
      .collection("pedidos")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const pedidos = snapshot.docs
      .map((doc) => {
        const datos = doc.data();
        const paymentIntentId = datos.paymentIntentId
          ? String(datos.paymentIntentId)
          : undefined;
        const amount = Number(datos.amount ?? 0);
        return {
          id: doc.id,
          uid: String(datos.uid ?? ""),
          email: datos.email ? String(datos.email) : null,
          estado: String(datos.estado ?? ""),
          metodoPago: datos.metodoPago ? String(datos.metodoPago) : null,
          amount,
          totalPesos: montoPedidoEnPesos({ amount, paymentIntentId }),
          createdAt: datos.createdAt?.toDate?.()?.toISOString() ?? null,
        };
      })
      .filter((pedido) => ESTADOS_PENDIENTES.has(pedido.estado));

    return NextResponse.json({ pedidos });
  } catch {
    return NextResponse.json({ error: "ERROR_INTERNO" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { obtenerFirestoreAdmin } from "@/lib/firebase-admin";
import { verificarAdminRequest } from "@/lib/admin-auth";

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
      .collection("postulaciones")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const postulaciones = snapshot.docs
      .map((doc) => {
        const datos = doc.data();
        return {
          id: doc.id,
          nombre: String(datos.nombre ?? ""),
          email: String(datos.email ?? ""),
          telefono: String(datos.telefono ?? ""),
          estado: String(datos.estado ?? ""),
          cvNombre: datos.cvNombre ? String(datos.cvNombre) : null,
          createdAt: datos.createdAt?.toDate?.()?.toISOString() ?? null,
        };
      })
      .filter((postulacion) => postulacion.estado === "recibida");

    return NextResponse.json({ postulaciones });
  } catch {
    return NextResponse.json({ error: "ERROR_INTERNO" }, { status: 500 });
  }
}

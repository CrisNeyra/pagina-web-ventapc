import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  firebaseAdminConfigurado,
  obtenerFirestoreAdmin,
  obtenerStorageAdmin,
} from "@/lib/firebase-admin";

const MAX_CV_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!firebaseAdminConfigurado()) {
    return NextResponse.json(
      { error: "POSTULACIONES_NO_CONFIGURADAS" },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const nombre = String(formData.get("nombre") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const telefono = String(formData.get("telefono") ?? "").trim();
    const mensaje = String(formData.get("mensaje") ?? "").trim();
    const cv = formData.get("cv");

    if (!nombre || !email || !telefono) {
      return NextResponse.json({ error: "CAMPOS_REQUERIDOS" }, { status: 400 });
    }

    if (!(cv instanceof File) || cv.type !== "application/pdf") {
      return NextResponse.json({ error: "CV_INVALIDO" }, { status: 400 });
    }

    if (cv.size > MAX_CV_BYTES) {
      return NextResponse.json({ error: "CV_DEMASIADO_GRANDE" }, { status: 400 });
    }

    const postulacionId = randomUUID();
    const cvPath = `postulaciones/${postulacionId}/${cv.name}`;
    const buffer = Buffer.from(await cv.arrayBuffer());

    const storage = obtenerStorageAdmin();
    const db = obtenerFirestoreAdmin();
    if (!storage || !db) {
      return NextResponse.json({ error: "FIREBASE_ADMIN_ERROR" }, { status: 503 });
    }

    const bucket = storage.bucket();
    const archivo = bucket.file(cvPath);
    await archivo.save(buffer, {
      metadata: { contentType: "application/pdf" },
    });

    await db.collection("postulaciones").doc(postulacionId).set({
      nombre,
      email,
      telefono,
      mensaje,
      cvPath,
      cvNombre: cv.name,
      estado: "recibida",
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: postulacionId });
  } catch {
    return NextResponse.json({ error: "ERROR_INTERNO" }, { status: 500 });
  }
}

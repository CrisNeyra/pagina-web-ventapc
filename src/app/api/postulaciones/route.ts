import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { crearPostulacion, ExtrasError } from "@/lib/extras-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "POSTULACIONES_NO_CONFIGURADAS" },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "DATOS_INVALIDOS" }, { status: 400 });
  }

  const nombre = String(form.get("nombre") ?? "");
  const email = String(form.get("email") ?? "");
  const telefono = String(form.get("telefono") ?? "");
  const mensaje = String(form.get("mensaje") ?? "");
  const cv = form.get("cv");

  if (!(cv instanceof File)) {
    return NextResponse.json({ message: "CV_INVALIDO" }, { status: 400 });
  }

  const cvBuffer = Buffer.from(await cv.arrayBuffer());

  try {
    const postulacion = await crearPostulacion({
      nombre,
      email,
      telefono,
      mensaje,
      cvBuffer,
      cvNombreOriginal: cv.name || "curriculum.pdf",
    });
    return NextResponse.json(postulacion, { status: 201 });
  } catch (error) {
    const mensajeError =
      error instanceof ExtrasError ? error.message : "ERROR_POSTULACION";
    const status =
      mensajeError === "CV_DEMASIADO_GRANDE" || mensajeError === "CV_INVALIDO"
        ? 400
        : mensajeError === "CAMPOS_REQUERIDOS"
          ? 400
          : 400;
    return NextResponse.json({ message: mensajeError }, { status });
  }
}

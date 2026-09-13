import { NextResponse } from "next/server";
import { databaseUrlConfigurada } from "@/lib/prisma";
import { verificarAdminRequest } from "@/lib/admin-auth";
import { obtenerCvPostulacionAdmin } from "@/lib/admin-server";
import { OrderError } from "@/lib/orders-server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!databaseUrlConfigurada()) {
    return NextResponse.json(
      { message: "Falta DATABASE_URL (Neon/Postgres)." },
      { status: 503 }
    );
  }

  const admin = await verificarAdminRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ message: "NO_AUTORIZADO" }, { status: admin.status });
  }

  const { id } = await context.params;

  try {
    const { buffer, nombre } = await obtenerCvPostulacionAdmin(id);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${nombre.replace(/"/g, "")}"`,
      },
    });
  } catch (error) {
    const mensaje = error instanceof OrderError ? error.message : "ERROR_CV";
    const status = mensaje === "POSTULACION_NO_ENCONTRADA" ? 404 : 404;
    return NextResponse.json({ message: mensaje }, { status });
  }
}

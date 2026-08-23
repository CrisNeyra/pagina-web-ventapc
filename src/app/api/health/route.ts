import { NextResponse } from "next/server";
import { firebaseAdminConfigurado } from "@/lib/firebase-admin";
import { apiConfigurada } from "@/lib/api-client";

export async function GET() {
  let apiOk = false;
  let apiServices: Record<string, boolean> | null = null;

  if (apiConfigurada()) {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, "");
      const respuesta = await fetch(`${base}/health`, { cache: "no-store" });
      if (respuesta.ok) {
        const datos = (await respuesta.json()) as {
          ok: boolean;
          services: Record<string, boolean>;
        };
        apiOk = datos.ok;
        apiServices = datos.services;
      }
    } catch {
      apiOk = false;
    }
  }

  return NextResponse.json({
    ok: apiOk || firebaseAdminConfigurado(),
    nextjs: true,
    firebaseAdmin: firebaseAdminConfigurado(),
    api: apiConfigurada(),
    apiOk,
    apiServices,
    timestamp: new Date().toISOString(),
  });
}

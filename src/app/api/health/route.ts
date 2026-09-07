import { NextResponse } from "next/server";
import { apiConfigurada } from "@/lib/api-client";

export async function GET() {
  let apiOk = false;
  let apiServices: Record<string, boolean | string> | null = null;

  if (apiConfigurada()) {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, "");
      const respuesta = await fetch(`${base}/health`, { cache: "no-store" });
      if (respuesta.ok) {
        const datos = (await respuesta.json()) as {
          ok: boolean;
          services: Record<string, boolean | string>;
        };
        apiOk = datos.ok;
        apiServices = datos.services;
      }
    } catch {
      apiOk = false;
    }
  }

  return NextResponse.json({
    ok: apiOk,
    nextjs: true,
    api: apiConfigurada(),
    apiOk,
    apiServices,
    timestamp: new Date().toISOString(),
  });
}

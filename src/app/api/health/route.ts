import { NextResponse } from "next/server";
import { apiConfigurada, usaApiExterna } from "@/lib/api-client";
import { databaseUrlConfigurada, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  let dbOk = false;
  let apiOk = false;
  let apiServices: Record<string, boolean | string> | null = null;

  if (databaseUrlConfigurada()) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }
  }

  if (usaApiExterna()) {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, "");
      const respuesta = await fetch(`${base}/health`, { cache: "no-store" });
      if (respuesta.ok) {
        const datos = (await respuesta.json()) as {
          ok: boolean;
          services?: Record<string, boolean | string>;
        };
        apiOk = datos.ok;
        apiServices = datos.services ?? null;
      }
    } catch {
      apiOk = false;
    }
  } else {
    apiOk = dbOk;
    apiServices = { postgres: dbOk, mode: "next-prisma" };
  }

  const ok = databaseUrlConfigurada() ? dbOk : apiOk;

  return NextResponse.json({
    ok,
    nextjs: true,
    database: databaseUrlConfigurada(),
    databaseOk: dbOk,
    api: apiConfigurada(),
    apiOk,
    apiServices,
    mode: usaApiExterna() ? "external-nest" : "next-prisma",
    timestamp: new Date().toISOString(),
  });
}

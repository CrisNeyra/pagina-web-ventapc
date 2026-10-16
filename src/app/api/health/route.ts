import { NextResponse } from "next/server";
import { apiConfigurada } from "@/lib/api-client";
import { databaseUrlConfigurada, prisma } from "@/lib/prisma";
import { proveedorRateLimit } from "@/lib/rate-limit";
import { emailConfigurado } from "@/lib/email-server";

export const runtime = "nodejs";

export async function GET() {
  let dbOk = false;

  if (databaseUrlConfigurada()) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }
  }

  return NextResponse.json({
    ok: dbOk,
    nextjs: true,
    database: databaseUrlConfigurada(),
    databaseOk: dbOk,
    api: apiConfigurada(),
    apiOk: dbOk,
    apiServices: { postgres: dbOk, mode: "next-prisma" },
    mode: "next-prisma",
    rateLimit: proveedorRateLimit(),
    email: emailConfigurado(),
    timestamp: new Date().toISOString(),
  });
}

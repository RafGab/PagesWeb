import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiProvider } from "@/lib/ai/registry";
import { env } from "@/lib/env";

// Comprobación de salud para el despliegue (sin datos sensibles).
export async function GET() {
  let database = "ok";
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }
  return NextResponse.json({ status: database === "ok" ? "ok" : "degraded", database, ai: aiProvider().isConfigured() ? aiProvider().id : "not_configured", climate: env().CLIMATE_PROVIDER });
}

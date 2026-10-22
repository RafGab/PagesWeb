import { NextResponse, after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { enforceRateLimit, route } from "@/lib/security/http";
import { createAnalysis, processAnalysis } from "@/lib/services/analysis";

const Answer = z.string().trim().max(500).optional();
const Body = z.object({
  kind: z.enum(["IDENTIFY", "DIAGNOSE"]),
  photoIds: z.array(z.string().min(5).max(40)).min(1).max(8),
  locationId: z.string().max(40).nullable().optional(),
  userPlantId: z.string().max(40).optional(),
  context: z
    .object({
      setting: z.enum(["indoor", "outdoor", "greenhouse"]).optional(),
      species: Answer,
      notes: Answer,
      watering: Answer,
      substrate: Answer,
      light: Answer,
      temperature: Answer,
      evolution: Answer,
      recentChanges: Answer,
    })
    .default({}),
});

export const POST = route(async (req) => {
  const user = await requireUser();
  enforceRateLimit(`analysis:${user.id}`, 20, 10 * 60_000);
  const body = Body.parse(await req.json());
  const { analysis, cached } = await createAnalysis({
    user,
    kind: body.kind,
    photoIds: body.photoIds,
    locationId: body.locationId,
    userContext: { ...body.context, ...(body.userPlantId ? { userPlantId: body.userPlantId } : {}) },
  });
  // Procesamiento asíncrono: la respuesta vuelve al momento y el cliente consulta el estado.
  if (!cached) after(() => processAnalysis(analysis.id));
  return NextResponse.json({ id: analysis.id, status: analysis.status, cached }, { status: cached ? 200 : 202 });
});

export const GET = route(async (req) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const analyses = await db.analysis.findMany({
    where: { userId: user.id, ...(kind === "IDENTIFY" || kind === "DIAGNOSE" || kind === "GARDEN_SPACE" ? { kind } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, kind: true, status: true, createdAt: true, result: true, isTestFixture: true, photos: { select: { photoId: true }, orderBy: { position: "asc" }, take: 1 } },
  });
  return NextResponse.json({ analyses });
});

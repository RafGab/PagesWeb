import { NextResponse, after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { enforceRateLimit, route } from "@/lib/security/http";
import { createAnalysis, processAnalysis } from "@/lib/services/analysis";
import { GARDEN_STYLES } from "@/lib/domain/garden-styles";
import { AppError } from "@/lib/errors";
import { aiProvider } from "@/lib/ai/registry";
import { notConfigured } from "@/lib/ai/providers/unconfigured";

const Body = z.object({
  title: z.string().trim().min(1).max(100),
  style: z.enum(GARDEN_STYLES),
  photoIds: z.array(z.string().max(40)).max(8).default([]),
  locationId: z.string().max(40).nullable().optional(),
  inputs: z.object({
    widthM: z.number().positive().max(10000).nullable().optional(),
    depthM: z.number().positive().max(10000).nullable().optional(),
    orientation: z.enum(["N", "NE", "E", "SE", "S", "SW", "W", "NW", "unknown"]).default("unknown"),
    budgetMax: z.number().nonnegative().max(10_000_000).nullable().optional(),
    currency: z.string().trim().length(3).toUpperCase().default("EUR"),
    maintenance: z.enum(["minimal", "moderate", "high"]).default("moderate"),
    uses: z.string().trim().max(500).optional(),
    keep: z.string().trim().max(500).optional(),
    soil: z.string().trim().max(200).optional(),
    spaceType: z.enum(["patio", "garden", "terrace", "balcony", "plot", "rural", "lawn", "other"]).default("garden"),
  }),
});

export const GET = route(async () => {
  const user = await requireUser();
  const designs = await db.gardenDesign.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { versions: { orderBy: { version: "desc" }, take: 1, select: { id: true, version: true, createdAt: true } } },
  });
  return NextResponse.json({ designs });
});

export const POST = route(async (req) => {
  const user = await requireUser();
  enforceRateLimit(`design:${user.id}`, 10, 60 * 60_000);
  if (!aiProvider().isConfigured()) throw notConfigured();
  const body = Body.parse(await req.json());
  if (body.locationId && !(await db.location.findFirst({ where: { id: body.locationId, userId: user.id } }))) throw new AppError("NOT_FOUND", "Ubicación no encontrada.");
  const inputs = {
    plotWidthM: body.inputs.widthM ?? null,
    plotDepthM: body.inputs.depthM ?? null,
    orientationOfMainArea: body.inputs.orientation,
    budgetMax: body.inputs.budgetMax ? `${body.inputs.budgetMax} ${body.inputs.currency}` : null,
    currency: body.inputs.currency,
    desiredMaintenance: body.inputs.maintenance,
    uses: body.inputs.uses,
    elementsToKeep: body.inputs.keep,
    soil: body.inputs.soil,
    spaceType: body.inputs.spaceType,
    requestedStyle: body.style === "recommend" ? "recommend the best style for this space" : body.style,
  };
  const design = await db.gardenDesign.create({ data: { userId: user.id, title: body.title, style: body.style, inputs } });
  try {
    const { analysis } = await createAnalysis({ user, kind: "GARDEN_SPACE", photoIds: body.photoIds, locationId: body.locationId, userContext: { designId: design.id } });
    after(() => processAnalysis(analysis.id));
    return NextResponse.json({ designId: design.id, analysisId: analysis.id }, { status: 202 });
  } catch (err) {
    await db.gardenDesign.delete({ where: { id: design.id } });
    throw err;
  }
});

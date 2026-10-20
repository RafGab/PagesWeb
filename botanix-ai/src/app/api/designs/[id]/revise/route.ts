import { NextResponse, after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { enforceRateLimit, route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";
import { createAnalysis, processAnalysis } from "@/lib/services/analysis";

type Ctx = { params: Promise<{ id: string }> };
const Body = z.object({ changeRequest: z.string().trim().min(3).max(1000), fromVersionId: z.string().max(40) });

/** Diseño iterativo: genera una nueva versión a partir de otra y una petición de cambios. */
export const POST = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  enforceRateLimit(`design:${user.id}`, 10, 60 * 60_000);
  const { id } = await params;
  const body = Body.parse(await req.json());
  const design = await db.gardenDesign.findFirst({ where: { id, userId: user.id } });
  if (!design) throw new AppError("NOT_FOUND", "Diseño no encontrado.");
  const from = await db.designVersion.findFirst({ where: { id: body.fromVersionId, designId: id } });
  if (!from) throw new AppError("NOT_FOUND", "Versión no encontrada.");
  const firstAnalysis = await db.analysis.findFirst({
    where: { userId: user.id, kind: "GARDEN_SPACE", context: { path: ["designId"], equals: id } },
    orderBy: { createdAt: "asc" },
    include: { photos: { orderBy: { position: "asc" } } },
  });
  const ctx = (firstAnalysis?.context ?? {}) as { locationId?: string | null };
  const { analysis } = await createAnalysis({
    user,
    kind: "GARDEN_SPACE",
    photoIds: firstAnalysis?.photos.map((p) => p.photoId) ?? [],
    locationId: ctx.locationId ?? null,
    userContext: { designId: id, previousVersionId: from.id, changeRequest: body.changeRequest },
  });
  after(() => processAnalysis(analysis.id));
  return NextResponse.json({ analysisId: analysis.id }, { status: 202 });
});

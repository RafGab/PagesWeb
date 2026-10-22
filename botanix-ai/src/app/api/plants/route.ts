import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";
import { retainPhotos } from "@/lib/services/photos";

const Body = z.object({
  nickname: z.string().trim().min(1).max(80),
  scientificName: z.string().trim().max(120).nullable().optional(),
  commonName: z.string().trim().max(120).nullable().optional(),
  locationNote: z.string().trim().max(200).nullable().optional(),
  potted: z.boolean().default(true),
  gardenId: z.string().max(40).nullable().optional(),
  sourceAnalysisId: z.string().max(40).nullable().optional(),
  coverPhotoId: z.string().max(40).nullable().optional(),
  sownAt: z.coerce.date().nullable().optional(),
  acquiredAt: z.coerce.date().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const GET = route(async () => {
  const user = await requireUser();
  const plants = await db.userPlant.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { reminders: { where: { enabled: true }, orderBy: { nextDueAt: "asc" }, take: 1 } },
  });
  return NextResponse.json({ plants });
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const body = Body.parse(await req.json());
  let taxonId: string | null = null;
  if (body.sourceAnalysisId) {
    const a = await db.analysis.findFirst({ where: { id: body.sourceAnalysisId, userId: user.id } });
    if (!a) throw new AppError("NOT_FOUND", "Análisis no encontrado.");
    taxonId = a.taxonId;
  }
  if (body.gardenId && !(await db.garden.findFirst({ where: { id: body.gardenId, userId: user.id } }))) throw new AppError("NOT_FOUND", "Jardín no encontrado.");
  if (body.coverPhotoId) {
    if (!(await db.photo.findFirst({ where: { id: body.coverPhotoId, userId: user.id } }))) throw new AppError("NOT_FOUND", "Foto no encontrada.");
    await retainPhotos(user.id, [body.coverPhotoId]);
  }
  const plant = await db.userPlant.create({ data: { ...body, taxonId, userId: user.id } });
  return NextResponse.json({ plant }, { status: 201 });
});

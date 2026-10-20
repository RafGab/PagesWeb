import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";
import { getOwnedPhotos, retainPhotos } from "@/lib/services/photos";

type Ctx = { params: Promise<{ id: string }> };
const Body = z.object({
  date: z.coerce.date().default(() => new Date()),
  title: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(3000).nullable().optional(),
  heightCm: z.number().min(0).max(10000).nullable().optional(),
  healthScore: z.number().int().min(1).max(5).nullable().optional(),
  photoIds: z.array(z.string().max(40)).max(6).default([]),
});

export const POST = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const plant = await db.userPlant.findFirst({ where: { id, userId: user.id } });
  if (!plant) throw new AppError("NOT_FOUND", "Planta no encontrada.");
  const { photoIds, ...body } = Body.parse(await req.json());
  await getOwnedPhotos(user.id, photoIds);
  await retainPhotos(user.id, photoIds);
  const entry = await db.journalEntry.create({
    data: { ...body, userId: user.id, userPlantId: plant.id, photos: { create: photoIds.map((photoId) => ({ photoId })) } },
  });
  if (photoIds.length && !plant.coverPhotoId) await db.userPlant.update({ where: { id: plant.id }, data: { coverPhotoId: photoIds[0] } });
  return NextResponse.json({ entry }, { status: 201 });
});

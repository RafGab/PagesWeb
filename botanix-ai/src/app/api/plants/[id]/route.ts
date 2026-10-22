import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";

type Ctx = { params: Promise<{ id: string }> };

const Patch = z.object({
  nickname: z.string().trim().min(1).max(80).optional(),
  scientificName: z.string().trim().max(120).nullable().optional(),
  commonName: z.string().trim().max(120).nullable().optional(),
  locationNote: z.string().trim().max(200).nullable().optional(),
  potted: z.boolean().optional(),
  status: z.enum(["healthy", "watch", "sick", "recovering", "dormant", "dead", "harvested"]).optional(),
  germinatedAt: z.coerce.date().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const plant = await db.userPlant.findFirst({
    where: { id, userId: user.id },
    include: {
      careEvents: { orderBy: { date: "desc" }, take: 100 },
      journal: { orderBy: { date: "desc" }, include: { photos: { select: { photoId: true } } } },
      reminders: { orderBy: { nextDueAt: "asc" } },
      diagnoses: { orderBy: { createdAt: "desc" }, include: { analysis: { select: { id: true, createdAt: true } } } },
      taxon: { include: { profiles: true } },
    },
  });
  if (!plant) throw new AppError("NOT_FOUND", "Planta no encontrada.");
  return NextResponse.json({ plant });
});

export const PATCH = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const body = Patch.parse(await req.json());
  const { count } = await db.userPlant.updateMany({ where: { id, userId: user.id }, data: body });
  if (!count) throw new AppError("NOT_FOUND", "Planta no encontrada.");
  return NextResponse.json({ ok: true });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { count } = await db.userPlant.deleteMany({ where: { id, userId: user.id } });
  if (!count) throw new AppError("NOT_FOUND", "Planta no encontrada.");
  return NextResponse.json({ ok: true });
});

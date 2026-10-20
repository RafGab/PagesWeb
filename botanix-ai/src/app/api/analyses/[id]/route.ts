import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const analysis = await db.analysis.findFirst({
    where: { id, userId: user.id },
    include: { photos: { orderBy: { position: "asc" }, select: { photoId: true } } },
  });
  if (!analysis) throw new AppError("NOT_FOUND", "Análisis no encontrado.");
  const { inputHash: _h, ...safe } = analysis;
  void _h;
  return NextResponse.json({ analysis: safe });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { count } = await db.analysis.deleteMany({ where: { id, userId: user.id } });
  if (!count) throw new AppError("NOT_FOUND", "Análisis no encontrado.");
  return NextResponse.json({ ok: true });
});

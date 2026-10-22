import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const design = await db.gardenDesign.findFirst({ where: { id, userId: user.id }, include: { versions: { orderBy: { version: "desc" } } } });
  if (!design) throw new AppError("NOT_FOUND", "Diseño no encontrado.");
  // Análisis en curso o fallidos asociados a este diseño.
  const pending = await db.analysis.findMany({
    where: { userId: user.id, kind: "GARDEN_SPACE", context: { path: ["designId"], equals: id } },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: { id: true, status: true, errorCode: true, errorMessage: true, warnings: true, createdAt: true },
  });
  return NextResponse.json({ design, latestAnalysis: pending[0] ?? null });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { count } = await db.gardenDesign.deleteMany({ where: { id, userId: user.id } });
  if (!count) throw new AppError("NOT_FOUND", "Diseño no encontrado.");
  return NextResponse.json({ ok: true });
});

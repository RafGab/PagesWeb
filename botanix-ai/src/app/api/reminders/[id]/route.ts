import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";

type Ctx = { params: Promise<{ id: string }> };
const Patch = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  intervalDays: z.number().int().min(1).max(730).optional(),
  enabled: z.boolean().optional(),
  seasonAdaptive: z.boolean().optional(),
  nextDueAt: z.coerce.date().optional(),
});

export const PATCH = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { count } = await db.reminder.updateMany({ where: { id, userId: user.id }, data: Patch.parse(await req.json()) });
  if (!count) throw new AppError("NOT_FOUND", "Recordatorio no encontrado.");
  return NextResponse.json({ ok: true });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { count } = await db.reminder.deleteMany({ where: { id, userId: user.id } });
  if (!count) throw new AppError("NOT_FOUND", "Recordatorio no encontrado.");
  return NextResponse.json({ ok: true });
});

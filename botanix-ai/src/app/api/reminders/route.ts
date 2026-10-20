import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";

const Body = z.object({
  type: z.enum(["WATERING", "FERTILIZING", "PRUNING", "TRANSPLANT", "SOWING", "GERMINATION", "HARVEST", "TREATMENT", "PEST_PREVENTION", "OTHER"]),
  title: z.string().trim().min(1).max(120),
  intervalDays: z.number().int().min(1).max(730),
  userPlantId: z.string().max(40).nullable().optional(),
  firstDueAt: z.coerce.date().optional(),
  seasonAdaptive: z.boolean().default(true),
});

export const GET = route(async () => {
  const user = await requireUser();
  const reminders = await db.reminder.findMany({ where: { userId: user.id }, orderBy: { nextDueAt: "asc" }, include: { userPlant: { select: { id: true, nickname: true } } } });
  return NextResponse.json({ reminders });
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const { firstDueAt, ...body } = Body.parse(await req.json());
  if (body.userPlantId && !(await db.userPlant.findFirst({ where: { id: body.userPlantId, userId: user.id } }))) throw new AppError("NOT_FOUND", "Planta no encontrada.");
  const reminder = await db.reminder.create({
    data: { ...body, userId: user.id, nextDueAt: firstDueAt ?? new Date(Date.now() + body.intervalDays * 86_400_000) },
  });
  return NextResponse.json({ reminder }, { status: 201 });
});

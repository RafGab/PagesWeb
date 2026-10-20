import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";

type Ctx = { params: Promise<{ id: string }> };
const CareType = z.enum(["WATERING", "FERTILIZING", "PRUNING", "TRANSPLANT", "SOWING", "GERMINATION", "HARVEST", "TREATMENT", "PEST_PREVENTION", "OTHER"]);
const Body = z.object({ type: CareType, date: z.coerce.date().default(() => new Date()), quantity: z.string().trim().max(80).nullable().optional(), notes: z.string().trim().max(1000).nullable().optional() });

export const POST = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const plant = await db.userPlant.findFirst({ where: { id, userId: user.id } });
  if (!plant) throw new AppError("NOT_FOUND", "Planta no encontrada.");
  const body = Body.parse(await req.json());
  const event = await db.careEvent.create({ data: { ...body, userId: user.id, userPlantId: plant.id } });
  // Hitos que se reflejan en la ficha de la planta.
  if (body.type === "GERMINATION") await db.userPlant.update({ where: { id: plant.id }, data: { germinatedAt: body.date } });
  if (body.type === "SOWING" && !plant.sownAt) await db.userPlant.update({ where: { id: plant.id }, data: { sownAt: body.date } });
  return NextResponse.json({ event }, { status: 201 });
});

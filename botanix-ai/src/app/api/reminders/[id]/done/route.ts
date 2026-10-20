import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";
import { getLocation } from "@/lib/services/context";
import { getClimateContext } from "@/lib/climate/service";
import { nextDueDate } from "@/lib/garden/reminders";

type Ctx = { params: Promise<{ id: string }> };

/** Marca el recordatorio como hecho, registra el cuidado y calcula la próxima fecha según el clima del mes. */
export const POST = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const reminder = await db.reminder.findFirst({ where: { id, userId: user.id }, include: { userPlant: { include: { garden: true } } } });
  if (!reminder) throw new AppError("NOT_FOUND", "Recordatorio no encontrado.");
  const now = new Date();
  let normals = null;
  if (reminder.seasonAdaptive) {
    const loc = await getLocation(user.id, reminder.userPlant?.garden?.locationId ?? null);
    // Una planta en maceta de interior no sigue el clima exterior.
    const indoor = reminder.userPlant?.potted && /interior|indoor/i.test(reminder.userPlant.locationNote ?? "");
    if (loc && !indoor) normals = await getClimateContext(loc.latitude, loc.longitude, loc.elevationM).then((c) => c.normals.months).catch(() => null);
  }
  const nextDueAt = nextDueDate(reminder.type, reminder.intervalDays, now, normals, reminder.seasonAdaptive);
  await db.$transaction([
    db.reminder.update({ where: { id: reminder.id }, data: { lastDoneAt: now, nextDueAt } }),
    ...(reminder.userPlantId ? [db.careEvent.create({ data: { userId: user.id, userPlantId: reminder.userPlantId, type: reminder.type, date: now, notes: reminder.title } })] : []),
  ]);
  return NextResponse.json({ nextDueAt });
});

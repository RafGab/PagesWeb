import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";
import { roundCoord } from "@/lib/climate/service";
import { LocationBody } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

async function owned(userId: string, id: string) {
  const loc = await db.location.findFirst({ where: { id, userId } });
  if (!loc) throw new AppError("NOT_FOUND", "Ubicación no encontrada.");
  return loc;
}

export const PATCH = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await owned(user.id, id);
  const body = LocationBody.partial().parse(await req.json());
  const location = await db.$transaction(async (tx) => {
    if (body.isDefault) await tx.location.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    return tx.location.update({
      where: { id },
      data: { ...body, ...(body.latitude !== undefined && { latitude: roundCoord(body.latitude) }), ...(body.longitude !== undefined && { longitude: roundCoord(body.longitude) }) },
    });
  });
  return NextResponse.json({ location });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await owned(user.id, id);
  await db.location.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});

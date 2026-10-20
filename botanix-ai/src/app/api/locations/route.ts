import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { roundCoord } from "@/lib/climate/service";
import { LocationBody } from "@/lib/validation";


export const GET = route(async () => {
  const user = await requireUser();
  const locations = await db.location.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] });
  return NextResponse.json({ locations });
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const body = LocationBody.parse(await req.json());
  const count = await db.location.count({ where: { userId: user.id } });
  const isDefault = body.isDefault ?? count === 0;
  const location = await db.$transaction(async (tx) => {
    if (isDefault) await tx.location.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    return tx.location.create({
      data: { ...body, latitude: roundCoord(body.latitude), longitude: roundCoord(body.longitude), isDefault, userId: user.id },
    });
  });
  return NextResponse.json({ location }, { status: 201 });
});

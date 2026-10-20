import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, destroySession } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { deletePhotoFiles } from "@/lib/services/photos";
import { PLANS } from "@/lib/plans";
import { monthStart, monthlyCostUsd } from "@/lib/services/usage";

const Patch = z.object({
  name: z.string().trim().max(80).nullable().optional(),
  locale: z.enum(["es", "en"]).optional(),
  unitSystem: z.enum(["METRIC", "IMPERIAL"]).optional(),
  experience: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"]).optional(),
  housingType: z.string().trim().max(80).nullable().optional(),
  budgetLevel: z.enum(["low", "medium", "high"]).nullable().optional(),
  maintenancePref: z.enum(["minimal", "moderate", "high"]).nullable().optional(),
  gardeningPrefs: z.array(z.string().trim().max(40)).max(20).optional(),
  hasChildren: z.boolean().nullable().optional(),
  hasPets: z.boolean().nullable().optional(),
  imageConsent: z.boolean().optional(),
});

export const GET = route(async () => {
  const user = await requireUser();
  const since = monthStart();
  const [analyses, designs, chat, cost] = await Promise.all([
    db.analysis.count({ where: { userId: user.id, kind: { in: ["IDENTIFY", "DIAGNOSE"] }, createdAt: { gte: since }, status: { notIn: ["FAILED", "NOT_CONFIGURED"] } } }),
    db.analysis.count({ where: { userId: user.id, kind: "GARDEN_SPACE", createdAt: { gte: since }, status: { notIn: ["FAILED", "NOT_CONFIGURED"] } } }),
    db.chatMessage.count({ where: { role: "user", createdAt: { gte: since }, conversation: { userId: user.id } } }),
    monthlyCostUsd(user.id),
  ]);
  const { passwordHash: _omit, ...safe } = user;
  void _omit;
  return NextResponse.json({ user: safe, plan: PLANS[user.plan], usage: { analyses, designs, chat, costUsd: cost } });
});

export const PATCH = route(async (req) => {
  const user = await requireUser();
  const { imageConsent, ...rest } = Patch.parse(await req.json());
  await db.user.update({
    where: { id: user.id },
    data: { ...rest, ...(imageConsent === undefined ? {} : { imageConsentAt: imageConsent ? new Date() : null }) },
  });
  return NextResponse.json({ ok: true });
});

// Derecho de supresión (RGPD art. 17): borra la cuenta, sus filas en cascada y los archivos.
export const DELETE = route(async () => {
  const user = await requireUser();
  const photos = await db.photo.findMany({ where: { userId: user.id }, select: { storageKey: true } });
  await db.user.delete({ where: { id: user.id } });
  await deletePhotoFiles(photos.map((p) => p.storageKey));
  await destroySession();
  return NextResponse.json({ ok: true });
});

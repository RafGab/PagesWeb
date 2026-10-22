import "server-only";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { aiProvider } from "@/lib/ai/registry";
import { notConfigured } from "@/lib/ai/providers/unconfigured";
import { PLANS } from "@/lib/plans";

/** Datos comunes de los formularios de análisis. */
export async function analysisFormData(user: User) {
  const [locations, plants] = await Promise.all([
    db.location.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }], select: { id: true, label: true, city: true, countryName: true } }),
    db.userPlant.findMany({ where: { userId: user.id }, orderBy: { nickname: "asc" }, select: { id: true, nickname: true } }),
  ]);
  const configured = aiProvider().isConfigured();
  return {
    locations,
    plants,
    maxPhotos: PLANS[user.plan].maxPhotosPerAnalysis,
    hasConsent: Boolean(user.imageConsentAt),
    aiConfigured: configured,
    aiHelp: configured ? undefined : (notConfigured().details as { help: string[] }).help,
  };
}

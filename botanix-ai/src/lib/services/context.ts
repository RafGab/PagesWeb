import "server-only";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { getClimateContext } from "@/lib/climate/service";
import { KOPPEN_LABELS } from "@/lib/climate/classify";
import { monthName } from "@/lib/sowing/engine";

export async function getLocation(userId: string, locationId?: string | null) {
  if (locationId) return db.location.findFirst({ where: { id: locationId, userId } });
  return db.location.findFirst({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] });
}

/** Contexto común para la IA: ubicación aproximada, resumen climático y perfil (sin datos identificativos). */
export async function buildAiContext(user: User, locationId?: string | null) {
  const lang = user.locale === "en" ? "en" : "es";
  const loc = await getLocation(user.id, locationId);
  const ctx: Record<string, unknown> = {
    experience: user.experience,
    units: user.unitSystem,
    currentMonth: monthName(new Date().getMonth() + 1, lang),
    childrenAtHome: user.hasChildren ?? undefined,
    petsAtHome: user.hasPets ?? undefined,
  };
  if (loc) {
    ctx.location = [loc.city, loc.region, loc.countryName].filter(Boolean).join(", ");
    ctx.hemisphere = loc.latitude >= 0 ? "north" : "south";
    if (loc.elevationM != null) ctx.elevationM = Math.round(loc.elevationM);
    if (loc.notes) ctx.microclimateNotes = loc.notes;
    try {
      const { summary } = await getClimateContext(loc.latitude, loc.longitude, loc.elevationM);
      ctx.climate = {
        koppen: `${summary.koppen} (${KOPPEN_LABELS[summary.koppen]?.en ?? ""})`,
        annualMeanC: summary.annualMeanC,
        annualPrecipMm: summary.annualPrecipMm,
        frostRiskMonths: summary.frostRiskMonths,
        dryMonths: summary.dryMonths,
        approxUsdaZone: summary.usdaZone,
      };
    } catch {
      ctx.climate = "unavailable";
    }
  }
  return { ctx, location: loc };
}

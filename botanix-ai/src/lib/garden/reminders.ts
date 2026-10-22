import type { CareType } from "@prisma/client";
import type { MonthlyNormal } from "@/lib/climate/types";

/**
 * Ajusta el intervalo de un recordatorio al clima del mes en que vence: más riego con calor,
 * menos en frío; el abonado se aplaza a la temporada de crecimiento. Sin datos climáticos,
 * se usa el intervalo configurado tal cual.
 */
export function adaptedIntervalDays(type: CareType, baseDays: number, month: MonthlyNormal | null): number {
  if (!month) return baseDays;
  const t = month.tMean;
  if (type === "WATERING") {
    const f = t >= 25 ? 0.6 : t >= 18 ? 0.8 : t >= 10 ? 1 : t >= 5 ? 1.4 : 2;
    return Math.max(1, Math.round(baseDays * f));
  }
  if (type === "FERTILIZING" && t < 10) return Math.max(baseDays, 30);
  return baseDays;
}

export function nextDueDate(type: CareType, baseDays: number, from: Date, normals: MonthlyNormal[] | null, seasonAdaptive: boolean): Date {
  const month = seasonAdaptive && normals ? normals[from.getUTCMonth()] : null;
  return new Date(from.getTime() + adaptedIntervalDays(type, baseDays, month) * 86_400_000);
}

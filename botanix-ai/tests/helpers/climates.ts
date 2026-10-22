import { FixtureClimateProvider } from "@/lib/climate/fixture";
import { summarizeClimate } from "@/lib/climate/classify";
import type { MonthlyNormal } from "@/lib/climate/types";

// DATOS DE PRUEBA: climas aproximados (no oficiales) usados solo para comprobar la lógica.
export async function fixtureClimate(name: "madrid" | "burgos" | "bogota") {
  const coords = { madrid: [40.42, -3.7], burgos: [42.34, -3.7], bogota: [4.61, -74.08] }[name];
  const n = await new FixtureClimateProvider().getNormals(coords[0], coords[1]);
  return { lat: coords[0], months: n.months, summary: summarizeClimate(n.months, coords[0]) };
}

/** Clima del hemisferio sur equivalente: mismos valores desplazados 6 meses. */
export function mirrorToSouth(months: MonthlyNormal[]): MonthlyNormal[] {
  return months.map((_, i) => ({ ...months[(i + 6) % 12], month: i + 1 }));
}

export function synthetic(row: Partial<MonthlyNormal>): MonthlyNormal[] {
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1, tMean: 26, tMin: 22, tMax: 31, absMin: 19, absMax: 34, precipMm: 250, frostDays: 0, hotDays: 0, sunshineHours: null, et0Mm: null, ...row,
  }));
}

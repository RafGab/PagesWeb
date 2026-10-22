import type { MonthlyNormal } from "./types";

export interface ClimateSummary {
  hemisphere: "north" | "south";
  annualMeanC: number;
  annualPrecipMm: number;
  coldestMonth: number;
  warmestMonth: number;
  koppen: string;
  koppenGroup: "A" | "B" | "C" | "D" | "E";
  isTropical: boolean;
  frostFreeMonths: number[]; // meses con riesgo de helada despreciable
  frostRiskMonths: number[];
  growingMonths: number[]; // media ≥ 10 °C y sin heladas frecuentes
  dryMonths: number[]; // precipitación < 2·T media (criterio de Gaussen)
  usdaZone: string | null;
  usdaZoneNote: string;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Clasificación de Köppen-Geiger según Peel, Finlayson y McMahon (2007). */
export function koppen(months: MonthlyNormal[], latitude: number): string {
  const T = months.map((m) => m.tMean);
  const P = months.map((m) => m.precipMm);
  const MAT = sum(T) / 12;
  const MAP = sum(P);
  const Thot = Math.max(...T);
  const Tcold = Math.min(...T);
  const Tmon10 = T.filter((t) => t >= 10).length;
  const Pdry = Math.min(...P);
  // Semestre cálido: abr–sep en el hemisferio norte, oct–mar en el sur.
  const summerIdx = latitude >= 0 ? [3, 4, 5, 6, 7, 8] : [9, 10, 11, 0, 1, 2];
  const winterIdx = [...Array(12).keys()].filter((i) => !summerIdx.includes(i));
  const Ps = summerIdx.map((i) => P[i]);
  const Pw = winterIdx.map((i) => P[i]);
  const Psdry = Math.min(...Ps), Pswet = Math.max(...Ps), Pwdry = Math.min(...Pw), Pwwet = Math.max(...Pw);
  const winterShare = MAP > 0 ? sum(Pw) / MAP : 0;
  const summerShare = MAP > 0 ? sum(Ps) / MAP : 0;
  const Pth = winterShare >= 0.7 ? 2 * MAT : summerShare >= 0.7 ? 2 * MAT + 28 : 2 * MAT + 14;

  if (Thot < 10) return Thot > 0 ? "ET" : "EF";
  if (MAP < 10 * Pth) return (MAP < 5 * Pth ? "BW" : "BS") + (MAT >= 18 ? "h" : "k");
  if (Tcold >= 18) {
    if (Pdry >= 60) return "Af";
    if (Pdry >= 100 - MAP / 25) return "Am";
    return "Aw";
  }
  const group = Tcold > 0 ? "C" : "D";
  let second = "f";
  if (Psdry < 40 && Psdry < Pwwet / 3) second = "s";
  else if (Pwdry < Pswet / 10) second = "w";
  let third: string;
  if (Thot >= 22) third = "a";
  else if (Tmon10 >= 4) third = "b";
  else if (group === "D" && Tcold < -38) third = "d";
  else third = "c";
  return group + second + third;
}

/** Zona de rusticidad USDA a partir de la mínima extrema media anual (°C). */
export function usdaZone(extremeMinC: number): string {
  const f = extremeMinC * 9 / 5 + 32;
  const zone = Math.floor((f + 60) / 10) + 1;
  if (zone < 1) return "1a";
  if (zone > 13) return "13b";
  const half = (f + 60) % 10 >= 5 ? "b" : "a";
  return `${zone}${half}`;
}

export function summarizeClimate(months: MonthlyNormal[], latitude: number): ClimateSummary {
  const T = months.map((m) => m.tMean);
  const k = koppen(months, latitude);
  const frostRiskMonths = months.filter((m) => m.frostDays >= 0.5 || m.absMin <= 0).map((m) => m.month);
  const frostFreeMonths = months.filter((m) => !frostRiskMonths.includes(m.month)).map((m) => m.month);
  const extremeMin = Math.min(...months.map((m) => m.absMin));
  return {
    hemisphere: latitude >= 0 ? "north" : "south",
    annualMeanC: Math.round((sum(T) / 12) * 10) / 10,
    annualPrecipMm: Math.round(sum(months.map((m) => m.precipMm))),
    coldestMonth: months[T.indexOf(Math.min(...T))].month,
    warmestMonth: months[T.indexOf(Math.max(...T))].month,
    koppen: k,
    koppenGroup: k[0] as ClimateSummary["koppenGroup"],
    isTropical: k.startsWith("A") || (Math.max(...T) - Math.min(...T) < 6 && Math.abs(latitude) < 23.5),
    frostFreeMonths,
    frostRiskMonths,
    growingMonths: months.filter((m) => m.tMean >= 10 && m.frostDays < 1).map((m) => m.month),
    dryMonths: months.filter((m) => m.precipMm < 2 * m.tMean).map((m) => m.month),
    usdaZone: usdaZone(extremeMin),
    usdaZoneNote:
      "Aproximada: calculada con la mínima mensual más baja promediada de datos de reanálisis en rejilla; los extremos locales reales suelen ser algo más fríos, sobre todo en valles y zonas de montaña.",
  };
}

export const KOPPEN_LABELS: Record<string, { es: string; en: string }> = {
  Af: { es: "Tropical húmedo (selva)", en: "Tropical rainforest" },
  Am: { es: "Tropical monzónico", en: "Tropical monsoon" },
  Aw: { es: "Tropical de sabana (estación seca)", en: "Tropical savanna" },
  BWh: { es: "Desértico cálido", en: "Hot desert" },
  BWk: { es: "Desértico frío", en: "Cold desert" },
  BSh: { es: "Estepario cálido (semiárido)", en: "Hot semi-arid" },
  BSk: { es: "Estepario frío (semiárido)", en: "Cold semi-arid" },
  Csa: { es: "Mediterráneo de verano cálido", en: "Hot-summer Mediterranean" },
  Csb: { es: "Mediterráneo de verano templado", en: "Warm-summer Mediterranean" },
  Csc: { es: "Mediterráneo de verano fresco", en: "Cold-summer Mediterranean" },
  Cfa: { es: "Subtropical húmedo", en: "Humid subtropical" },
  Cfb: { es: "Oceánico", en: "Oceanic" },
  Cfc: { es: "Oceánico subpolar", en: "Subpolar oceanic" },
  Cwa: { es: "Subtropical con invierno seco", en: "Monsoon-influenced humid subtropical" },
  Cwb: { es: "Templado de altura con invierno seco", en: "Subtropical highland" },
  Cwc: { es: "Templado de altura frío con invierno seco", en: "Cold subtropical highland" },
  Dfa: { es: "Continental húmedo de verano cálido", en: "Hot-summer humid continental" },
  Dfb: { es: "Continental húmedo de verano templado", en: "Warm-summer humid continental" },
  Dfc: { es: "Subártico", en: "Subarctic" },
  Dfd: { es: "Subártico extremo", en: "Extremely cold subarctic" },
  Dsa: { es: "Continental mediterráneo cálido", en: "Hot-summer Mediterranean continental" },
  Dsb: { es: "Continental mediterráneo templado", en: "Warm-summer Mediterranean continental" },
  Dsc: { es: "Subártico de verano seco", en: "Dry-summer subarctic" },
  Dwa: { es: "Continental monzónico cálido", en: "Monsoon-influenced hot-summer continental" },
  Dwb: { es: "Continental monzónico templado", en: "Monsoon-influenced warm-summer continental" },
  Dwc: { es: "Subártico monzónico", en: "Monsoon-influenced subarctic" },
  ET: { es: "Tundra / alta montaña", en: "Tundra" },
  EF: { es: "Glacial", en: "Ice cap" },
};

export type CropCategory = "vegetable" | "herb" | "flower" | "fruit_tree" | "fruit_perennial" | "lawn";
export type FrostTolerance = "very_tender" | "tender" | "half_hardy" | "hardy" | "very_hardy";
export type Level = "low" | "medium" | "high";

export interface I18nText {
  es: string;
  en: string;
}

/** Parámetros de un cultivo anual o de temporada (hortalizas, aromáticas, flores, césped). */
export interface SeasonalCropParams {
  kind: "seasonal";
  /** Temperatura del suelo para germinar (°C): mínima, rango óptimo y máxima. */
  germ: { min: number; optMin: number; optMax: number; max: number };
  /** Temperatura media mensual para crecer bien (°C). */
  grow: { min: number; optMin: number; optMax: number; max: number };
  frost: FrostTolerance;
  /** Temperatura a la que la planta sufre daño grave (°C). */
  killTempC: number;
  /** Se espiga o deja de cuajar con calor (máximas medias por encima de heatLimitC). */
  heatLimitC: number | null;
  method: "direct" | "transplant" | "both";
  weeksInSeedbed: number | null;
  /** Días hasta la cosecha o floración: desde siembra directa o desde trasplante. */
  daysToHarvest: [number, number];
  harvestFrom: "sowing" | "transplant";
  harvestWeeks: number; // duración aproximada de la cosecha
  sun: "full_sun" | "part_shade";
  water: Level;
  spacingCm: [inRow: number, betweenRows: number] | null;
  soil: I18nText;
  difficulty: "easy" | "moderate" | "hard";
  /** Variedades o tipos para climas concretos (orientación, no un catálogo). */
  varietyTips: I18nText | null;
  extendSeason: I18nText | null;
  /** Rendimiento orientativo solo cuando existe una referencia fiable; si no, null. */
  yieldNote: I18nText | null;
  /** Necesita un periodo frío tras la siembra (p. ej., el ajo para formar cabeza). */
  requiresCold?: { months: number; belowC: number };
}

/** Frutales y perennes leñosos: idoneidad por frío invernal, rusticidad y calor estival. */
export interface PerennialCropParams {
  kind: "perennial";
  /** Horas-frío (0–7,2 °C) que necesitan las variedades habituales y las de bajo requerimiento. */
  chillHours: { typical: [number, number]; lowChillVarieties: number | null };
  /** Mínima que soporta un ejemplar adulto sin daños graves (°C). */
  killTempC: number;
  /** Media del mes más cálido necesaria para madurar bien la fruta (°C). */
  minWarmMonthMeanC: number;
  /** Media del mes más frío por encima de la cual crece bien (frutales tropicales). */
  minColdMonthMeanC: number | null;
  /** Por encima de esta media del mes más cálido el cultivo sufre (frutales de clima de altura). */
  maxWarmMonthMeanC: number | null;
  yearsToFruit: [number, number];
  sun: "full_sun" | "part_shade";
  water: Level;
  spacingM: [number, number];
  soil: I18nText;
  difficulty: "easy" | "moderate" | "hard";
  varietyTips: I18nText | null;
}

export interface Crop {
  slug: string;
  category: CropCategory;
  scientificName: string;
  names: I18nText;
  params: SeasonalCropParams | PerennialCropParams;
  sourceIds: string[];
}

export type MonthQuality = "optimal" | "possible";

export interface CropCalendar {
  slug: string;
  directSow: Partial<Record<number, MonthQuality>>;
  seedbedSow: Partial<Record<number, MonthQuality>>; // semillero protegido
  transplant: Partial<Record<number, MonthQuality>>;
  harvest: number[];
  greenhouseOnly: number[]; // meses viables solo con invernadero o túnel
  notes: string[];
}

export interface PerennialSuitability {
  slug: string;
  verdict: "suitable" | "marginal" | "unsuitable";
  reasons: string[];
  plantingMonths: number[];
  chillHoursEstimate: number;
}

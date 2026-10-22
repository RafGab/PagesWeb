import type { MonthlyNormal } from "@/lib/climate/types";
import type { ClimateSummary } from "@/lib/climate/classify";
import { estimateChill } from "./chill";
import type { Crop, CropCalendar, MonthQuality, PerennialCropParams, PerennialSuitability, SeasonalCropParams } from "./types";

const AVG_MONTH_DAYS = 30.4;
const mod12 = (m: number) => ((((m - 1) % 12) + 12) % 12) + 1; // 1..12

export type Lang = "es" | "en";
const MONTHS: Record<Lang, string[]> = {
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
export const monthName = (m: number, lang: Lang) => MONTHS[lang][m - 1];

interface Env {
  months: MonthlyNormal[];
  greenhouse: boolean;
}

// Efecto aproximado de un invernadero frío o túnel sin calefacción.
function adjusted(m: MonthlyNormal, greenhouse: boolean): MonthlyNormal {
  if (!greenhouse) return m;
  return { ...m, tMean: m.tMean + 4, tMin: m.tMin + 2, tMax: m.tMax + 6, absMin: m.absMin + 3, frostDays: Math.max(0, m.frostDays - 6) };
}

const at = (env: Env, month: number) => adjusted(env.months[mod12(month) - 1], env.greenhouse);

function frostOk(p: SeasonalCropParams, m: MonthlyNormal) {
  if (m.absMin <= p.killTempC) return false;
  if ((p.frost === "tender" || p.frost === "very_tender") && m.frostDays >= 0.5) return false;
  return true;
}

/** Evalúa si el ciclo de cultivo que empieza en `start` y dura `days` es viable. */
function cycleQuality(p: SeasonalCropParams, env: Env, start: number, days: number): MonthQuality | null {
  const n = Math.max(1, Math.ceil(days / AVG_MONTH_DAYS));
  let optimal = true;
  let coldMonths = 0;
  const coldWindow = Math.ceil(n / 2); // el frío debe llegar en la primera mitad del ciclo (p. ej., ajo plantado en otoño)
  for (let i = 0; i < n; i++) {
    const m = at(env, start + i);
    const isLast = i === n - 1;
    if (!frostOk(p, m)) return null;
    if (m.tMean < p.grow.min || m.tMean > p.grow.max + 2) return null;
    if (p.heatLimitC !== null && m.tMax > p.heatLimitC + (isLast ? 2 : 0)) return null;
    if (m.tMean < p.grow.optMin - 1 || m.tMean > p.grow.optMax + 1) optimal = false;
    if (p.requiresCold && i < coldWindow && m.tMean < p.requiresCold.belowC) coldMonths++;
  }
  if (p.requiresCold && coldMonths < p.requiresCold.months) return null;
  return optimal ? "optimal" : "possible";
}

function germination(p: SeasonalCropParams, m: MonthlyNormal): MonthQuality | null {
  // La temperatura media del aire se usa como aproximación de la del suelo a 5–10 cm.
  if (m.tMean < p.germ.min || m.tMean > p.germ.max) return null;
  return m.tMean >= p.germ.optMin && m.tMean <= p.germ.optMax ? "optimal" : "possible";
}

const worst = (a: MonthQuality, b: MonthQuality): MonthQuality => (a === "possible" || b === "possible" ? "possible" : "optimal");
const meanDays = (p: SeasonalCropParams) => (p.daysToHarvest[0] + p.daysToHarvest[1]) / 2;

function computeCalendar(crop: Crop, p: SeasonalCropParams, env: Env) {
  const directSow: CropCalendar["directSow"] = {};
  const seedbedSow: CropCalendar["seedbedSow"] = {};
  const transplant: CropCalendar["transplant"] = {};
  const harvest = new Set<number>();
  const seedbedMonths = p.weeksInSeedbed ? Math.max(1, Math.ceil(p.weeksInSeedbed / 4.35)) : 0;

  const addHarvest = (sowMonth: number, fromTransplant: boolean) => {
    const offset = fromTransplant && p.harvestFrom === "sowing" ? -seedbedMonths * AVG_MONTH_DAYS : 0;
    const first = p.daysToHarvest[0] + offset;
    const last = p.daysToHarvest[1] + offset + p.harvestWeeks * 7;
    for (let d = Math.max(0, first); d <= last; d += 15) {
      const hm = sowMonth + Math.floor(d / AVG_MONTH_DAYS);
      const m = at(env, hm);
      // La cosecha termina cuando el frío mata o detiene el cultivo.
      if (!frostOk(p, m) || m.tMean < p.grow.min - 3) break;
      harvest.add(mod12(hm));
    }
  };

  for (let s = 1; s <= 12; s++) {
    if (p.method !== "transplant") {
      const g = germination(p, at(env, s));
      const c = g && cycleQuality(p, env, s, meanDays(p));
      if (g && c) {
        directSow[s] = worst(g, c);
        addHarvest(s, false);
      }
    }
    if (p.method !== "direct" && p.weeksInSeedbed) {
      const days = p.harvestFrom === "transplant" ? meanDays(p) : meanDays(p) - seedbedMonths * AVG_MONTH_DAYS;
      const c = cycleQuality(p, env, s, Math.max(20, days));
      if (c) {
        transplant[s] = c;
        seedbedSow[mod12(s - seedbedMonths)] = c;
        addHarvest(s, true);
      }
    }
  }
  return { directSow, seedbedSow, transplant, harvest: [...harvest].sort((a, b) => a - b) };
}

export function cropCalendar(crop: Crop, months: MonthlyNormal[], summary: ClimateSummary, lat: number, lang: Lang = "es"): CropCalendar {
  if (crop.params.kind !== "seasonal") throw new Error("cropCalendar solo admite cultivos de temporada");
  const p = crop.params;
  const outdoor = computeCalendar(crop, p, { months, greenhouse: false });
  const notes: string[] = [];
  let greenhouseOnly: number[] = [];

  const hasOutdoor = Object.keys(outdoor.directSow).length + Object.keys(outdoor.transplant).length > 0;
  if (!hasOutdoor) {
    const gh = computeCalendar(crop, p, { months, greenhouse: true });
    greenhouseOnly = [...new Set([...Object.keys(gh.directSow), ...Object.keys(gh.transplant)].map(Number))].sort((a, b) => a - b);
    notes.push(
      greenhouseOnly.length
        ? lang === "es"
          ? "Al aire libre el clima no es adecuado; viable en invernadero o túnel en los meses indicados."
          : "Not suitable outdoors here; feasible in a greenhouse or tunnel in the months shown."
        : lang === "es"
          ? "El clima de esta ubicación no es adecuado para este cultivo, ni siquiera con protección sencilla."
          : "This location's climate is not suitable for this crop, even with simple protection.",
    );
  }

  if (crop.slug === "onion") {
    const a = Math.abs(lat);
    const type = a < 32 ? (lang === "es" ? "día corto" : "short-day") : a <= 37 ? (lang === "es" ? "día corto o intermedio" : "short-day or intermediate") : a <= 42 ? (lang === "es" ? "intermedio o día largo" : "intermediate or long-day") : lang === "es" ? "día largo" : "long-day";
    notes.push(lang === "es" ? `A tu latitud (${a.toFixed(0)}°) conviene cebolla de ${type}.` : `At your latitude (${a.toFixed(0)}°) choose ${type} onions.`);
  }
  const wet = months.filter((m) => m.precipMm > 200).map((m) => m.month);
  if (wet.length && hasOutdoor) {
    notes.push(
      lang === "es"
        ? `Meses muy lluviosos (${wet.map((m) => monthName(m, lang)).join(", ")}): más riesgo de hongos; mejora el drenaje y la ventilación.`
        : `Very wet months (${wet.map((m) => monthName(m, lang)).join(", ")}): higher fungal risk; improve drainage and airflow.`,
    );
  }
  if (summary.dryMonths.length && hasOutdoor && p.water !== "low") {
    notes.push(lang === "es" ? "Necesitará riego en los meses secos." : "Will need irrigation in dry months.");
  }
  if (p.varietyTips) notes.push(p.varietyTips[lang]);
  if (p.extendSeason) notes.push(p.extendSeason[lang]);

  return { slug: crop.slug, ...outdoor, greenhouseOnly, notes };
}

// ───────────────────────── Frutales y perennes ─────────────────────────

export function perennialSuitability(crop: Crop, months: MonthlyNormal[], summary: ClimateSummary, lang: Lang = "es"): PerennialSuitability {
  if (crop.params.kind !== "perennial") throw new Error("perennialSuitability solo admite perennes");
  const p: PerennialCropParams = crop.params;
  const es = lang === "es";
  const reasons: string[] = [];
  let level = 0; // 0 apto, 1 marginal, 2 no apto
  const bump = (l: number, r: string) => {
    level = Math.max(level, l);
    reasons.push(r);
  };

  const extremeMin = Math.min(...months.map((m) => m.absMin));
  const warmest = Math.max(...months.map((m) => m.tMean));
  const coldest = Math.min(...months.map((m) => m.tMean));
  const chill = estimateChill(months);

  if (extremeMin < p.killTempC) bump(2, es ? `Las mínimas extremas habituales (≈ ${extremeMin} °C) bajan de lo que soporta (≈ ${p.killTempC} °C).` : `Typical extreme lows (≈ ${extremeMin} °C) fall below its limit (≈ ${p.killTempC} °C).`);
  else if (extremeMin < p.killTempC + 2) bump(1, es ? `Mínimas cercanas a su límite (${p.killTempC} °C): plántalo en el rincón más protegido y prevé protección en olas de frío.` : `Lows close to its limit (${p.killTempC} °C): plant in the most sheltered spot and protect during cold snaps.`);

  if (warmest < p.minWarmMonthMeanC - 2) bump(2, es ? `Veranos demasiado frescos (mes más cálido ≈ ${warmest} °C; necesita ≈ ${p.minWarmMonthMeanC} °C) para madurar la fruta.` : `Summers too cool (warmest month ≈ ${warmest} °C; needs ≈ ${p.minWarmMonthMeanC} °C) to ripen fruit.`);
  else if (warmest < p.minWarmMonthMeanC) bump(1, es ? "Calor estival justo: la fruta puede madurar tarde o con menos azúcar." : "Barely enough summer heat: fruit may ripen late or less sweet.");

  if (p.minColdMonthMeanC !== null) {
    if (coldest < p.minColdMonthMeanC - 2) bump(2, es ? `Inviernos demasiado frescos para esta especie tropical (mes más frío ≈ ${coldest} °C).` : `Winters too cool for this tropical species (coldest month ≈ ${coldest} °C).`);
    else if (coldest < p.minColdMonthMeanC) bump(1, es ? "Crecimiento lento en la estación fresca." : "Slow growth in the cool season.");
  }
  if (p.maxWarmMonthMeanC !== null) {
    if (warmest > p.maxWarmMonthMeanC + 2) bump(2, es ? `Demasiado calor (mes más cálido ≈ ${warmest} °C): prefiere climas templados de altura.` : `Too hot (warmest month ≈ ${warmest} °C): prefers mild highland climates.`);
    else if (warmest > p.maxWarmMonthMeanC) bump(1, es ? "El calor estival puede reducir la producción." : "Summer heat may reduce yields.");
  }

  const [needMin] = p.chillHours.typical;
  if (needMin > 0) {
    if (chill >= needMin) reasons.push(es ? `Frío invernal estimado ≈ ${chill} unidades: suficiente para variedades habituales (${needMin}+).` : `Estimated winter chill ≈ ${chill} units: enough for common varieties (${needMin}+).`);
    else if (p.chillHours.lowChillVarieties !== null && chill >= p.chillHours.lowChillVarieties) bump(1, es ? `Frío invernal estimado ≈ ${chill} unidades: elige solo variedades de bajo requerimiento (≈ ${p.chillHours.lowChillVarieties}).` : `Estimated winter chill ≈ ${chill} units: choose low-chill varieties only (≈ ${p.chillHours.lowChillVarieties}).`);
    else bump(2, es ? `Frío invernal insuficiente (≈ ${chill} unidades; necesita ${needMin}+): florecerá mal.` : `Not enough winter chill (≈ ${chill} units; needs ${needMin}+): it will flower poorly.`);
  }

  // Época de plantación.
  let plantingMonths: number[];
  const deciduous = needMin > 0;
  if (summary.frostRiskMonths.length === 0 && summary.isTropical) {
    const P = months.map((m) => m.precipMm);
    plantingMonths = months.filter((m, i) => P[i] >= 80 && P[(i + 11) % 12] < P[i]).map((m) => m.month);
    if (!plantingMonths.length) plantingMonths = months.filter((m) => m.precipMm >= 60).map((m) => m.month);
    reasons.push(es ? "En clima sin heladas, planta al comienzo de la temporada de lluvias o asegura riego." : "In frost-free climates, plant at the start of the rainy season or ensure irrigation.");
  } else if (deciduous) {
    plantingMonths = months.filter((m) => m.tMean >= 2 && m.tMean <= 14 && m.frostDays < 10).map((m) => m.month);
    reasons.push(es ? "Planta a raíz desnuda en reposo vegetativo, evitando suelo helado o encharcado." : "Plant bare-root while dormant, avoiding frozen or waterlogged soil.");
  } else {
    plantingMonths = months.filter((m) => m.tMean >= 13 && m.tMean <= 24 && m.frostDays < 0.5 && m.tMax < 32).map((m) => m.month);
    reasons.push(es ? "Planta en cepellón cuando ya no hay riesgo de heladas y antes del calor fuerte." : "Plant container stock after frost risk and before strong heat.");
  }

  if (p.varietyTips) reasons.push(p.varietyTips[lang]);
  return {
    slug: crop.slug,
    verdict: level === 0 ? "suitable" : level === 1 ? "marginal" : "unsuitable",
    reasons,
    plantingMonths: level === 2 ? [] : plantingMonths,
    chillHoursEstimate: chill,
  };
}

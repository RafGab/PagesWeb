import type { MonthlyNormal, Forecast } from "@/lib/climate/types";
import type { ClimateSummary } from "@/lib/climate/classify";
import { CROPS } from "./crops";
import { cropCalendar, perennialSuitability, monthName, type Lang } from "./engine";
import type { Crop, CropCalendar, MonthQuality, PerennialSuitability, SeasonalCropParams } from "./types";

export interface MonthPlan {
  month: number;
  directSow: string[];
  seedbed: string[];
  transplant: string[];
  harvest: string[];
  flowers: string[];
  treesShrubs: string[];
  lawn: string[];
  prune: string[];
  fertilize: string[];
  maintenance: string[];
  protect: string[];
  postpone: string[];
}

export interface FullCalendar {
  crops: CropCalendar[];
  perennials: PerennialSuitability[];
  months: MonthPlan[];
}

const isSeasonal = (c: Crop): c is Crop & { params: SeasonalCropParams } => c.params.kind === "seasonal";

export function buildCalendar(months: MonthlyNormal[], summary: ClimateSummary, lat: number, lang: Lang = "es"): FullCalendar {
  const es = lang === "es";
  const seasonal = CROPS.filter(isSeasonal);
  const crops = seasonal.map((c) => cropCalendar(c, months, summary, lat, lang));
  const perennials = CROPS.filter((c) => c.params.kind === "perennial").map((c) => perennialSuitability(c, months, summary, lang));
  const bySlug = new Map(CROPS.map((c) => [c.slug, c]));

  const tMeans = months.map((m) => m.tMean);
  const coldMonths = months.filter((m) => m.tMean < 10 && m.frostDays < 10).map((m) => m.month);
  const hotMonths = months.filter((m) => m.tMax > 32).map((m) => m.month);
  const wetMonths = months.filter((m) => m.precipMm > 150).map((m) => m.month);
  const sortedRain = [...months].sort((a, b) => a.precipMm - b.precipMm);
  const drierHalf = sortedRain.slice(0, 6).map((m) => m.month);
  const growing = summary.growingMonths;

  const plans: MonthPlan[] = months.map((m) => {
    const mm = m.month;
    const plan: MonthPlan = { month: mm, directSow: [], seedbed: [], transplant: [], harvest: [], flowers: [], treesShrubs: [], lawn: [], prune: [], fertilize: [], maintenance: [], protect: [], postpone: [] };
    for (const cal of crops) {
      const crop = bySlug.get(cal.slug)!;
      const target = crop.category === "flower" ? plan.flowers : crop.category === "lawn" ? plan.lawn : null;
      if (cal.directSow[mm]) (target ?? plan.directSow).push(cal.slug);
      if (cal.seedbedSow[mm] && !target) plan.seedbed.push(cal.slug);
      if (cal.transplant[mm]) (target ?? plan.transplant).push(cal.slug);
      if (cal.harvest.includes(mm) && crop.category !== "lawn" && crop.category !== "flower") plan.harvest.push(cal.slug);
    }
    plan.flowers = [...new Set(plan.flowers)];
    for (const p of perennials) if (p.verdict !== "unsuitable" && p.plantingMonths.includes(mm)) plan.treesShrubs.push(p.slug);

    // Poda
    if (coldMonths.length) {
      if (coldMonths.includes(mm)) plan.prune.push(es ? "Poda de invierno de frutales de hoja caduca y rosales (fuera de días de helada)" : "Winter pruning of deciduous fruit trees and roses (not on frosty days)");
    } else if (drierHalf.includes(mm) && !wetMonths.includes(mm)) {
      plan.prune.push(es ? "Poda de formación y limpieza en tiempo seco (las heridas cicatrizan mejor)" : "Formative and clean-up pruning in dry weather (wounds heal better)");
    }
    if (growing.length && mm === growing[Math.floor(growing.length / 2)]) plan.prune.push(es ? "Poda en verde y recorte de setos" : "Summer pruning and hedge trimming");

    // Abonado
    if (growing.length) {
      if (mm === growing[0]) plan.fertilize.push(es ? "Abonado de fondo con compost al comenzar la temporada de crecimiento" : "Base dressing with compost at the start of the growing season");
      if (growing.length > 3 && mm === growing[2]) plan.fertilize.push(es ? "Abonado de cobertera en hortalizas exigentes (tomate, calabacín, maíz)" : "Side-dress heavy feeders (tomato, squash, corn)");
    }
    if (plan.lawn.some((s) => s === "tall_fescue" || s === "ryegrass") && m.tMean < 20) plan.fertilize.push(es ? "Abonado ligero del césped de clima fresco" : "Light feed for cool-season lawn");

    // Mantenimiento
    if (m.tMean >= 12 && m.tMean <= 22 && tMeans[(mm + 10) % 12] < m.tMean) plan.maintenance.push(es ? "Vigilar pulgones y brotes tiernos (revisión semanal del envés de las hojas)" : "Watch for aphids on tender shoots (check leaf undersides weekly)");
    if (m.tMean >= 8 && m.tMean <= 20 && m.precipMm > 50) plan.maintenance.push(es ? "Riesgo de caracoles y babosas tras la lluvia: trampas y barreras" : "Snails and slugs after rain: traps and barriers");
    if (hotMonths.includes((mm % 12) + 1) && !hotMonths.includes(mm)) plan.maintenance.push(es ? "Acolchar el suelo y revisar el riego antes del calor" : "Mulch and check irrigation before the heat");
    if (summary.dryMonths.includes(mm)) plan.maintenance.push(es ? "Riego profundo y espaciado; regar al amanecer" : "Deep, infrequent watering; water at dawn");

    // Protección
    if (summary.frostRiskMonths.includes(mm)) plan.protect.push(es ? "Proteger cultivos sensibles con manta térmica y resguardar macetas tropicales" : "Cover tender crops with fleece and shelter tropical pots");
    if (hotMonths.includes(mm)) plan.protect.push(es ? "Sombrear plantones y hortalizas de hoja en las horas centrales" : "Shade seedlings and leafy crops at midday");
    if (wetMonths.includes(mm)) plan.protect.push(es ? "Asegurar el drenaje y la ventilación para prevenir hongos" : "Ensure drainage and airflow to prevent fungal disease");

    // Mejor posponer
    if (summary.frostRiskMonths.includes(mm)) plan.postpone.push(es ? "Trasplantar hortalizas de verano al exterior" : "Planting out summer vegetables");
    if (hotMonths.includes(mm)) plan.postpone.push(es ? "Plantar árboles, sembrar césped y podas fuertes" : "Planting trees, sowing lawns and hard pruning");
    if (m.precipMm > 200) plan.postpone.push(es ? "Labrar o pisar suelos encharcados" : "Digging or treading waterlogged soil");
    return plan;
  });

  return { crops, perennials, months: plans };
}

// ───────────────────────── ¿Qué puedo sembrar hoy? ─────────────────────────

export interface SowNowItem {
  slug: string;
  name: string;
  scientificName: string;
  category: Crop["category"];
  action: "direct" | "transplant" | "seedbed" | "plant";
  quality: MonthQuality;
  why: string;
  harvest: string;
  conditions: { sun: string; water: string; spacing: string | null; soil: string };
  difficulty: string;
  caution: string | null;
}

export interface SowNowResult {
  month: number;
  items: SowNowItem[];
  alternatives: string[];
  warnings: string[];
}

const ACTION_RANK = { direct: 0, transplant: 1, plant: 2, seedbed: 3 } as const;

export function whatToSowNow(
  months: MonthlyNormal[],
  summary: ClimateSummary,
  lat: number,
  month: number,
  opts: { lang?: Lang; forecast?: Forecast | null; experience?: string } = {},
): SowNowResult {
  const lang = opts.lang ?? "es";
  const es = lang === "es";
  const cal = buildCalendar(months, summary, lat, lang);
  const m = months[month - 1];
  const bySlug = new Map(CROPS.map((c) => [c.slug, c]));
  const warnings: string[] = [];
  const minForecast = opts.forecast?.daily.length ? Math.min(...opts.forecast.daily.map((d) => d.tMin)) : null;
  const maxForecast = opts.forecast?.daily.length ? Math.max(...opts.forecast.daily.map((d) => d.tMax)) : null;
  if (minForecast !== null && minForecast <= 1) warnings.push(es ? `Previsión: mínimas de hasta ${minForecast} °C en los próximos 7 días. Espera para sacar al exterior plantas sensibles.` : `Forecast: lows down to ${minForecast} °C in the next 7 days. Wait before planting out tender plants.`);
  if (maxForecast !== null && maxForecast >= 35) warnings.push(es ? `Previsión: máximas de ${maxForecast} °C. Siembra al atardecer, sombrea y riega bien.` : `Forecast: highs of ${maxForecast} °C. Sow in the evening, shade and water well.`);

  const items: SowNowItem[] = [];
  const harvestText = (c: Crop) => {
    if (c.params.kind !== "seasonal") return "";
    const [a, b] = c.params.daysToHarvest;
    const from = c.params.harvestFrom === "transplant" ? (es ? "desde el trasplante" : "from transplanting") : es ? "desde la siembra" : "from sowing";
    const verb = c.category === "flower" ? (es ? "Floración" : "Flowering") : c.category === "lawn" ? (es ? "Césped utilizable" : "Usable lawn") : es ? "Cosecha" : "Harvest";
    const end = new Date(2000, month - 1 + Math.round((a + b) / 2 / 30.4), 1).getMonth() + 1;
    return `${verb}: ${a}–${b} ${es ? "días" : "days"} ${from} (${es ? "hacia" : "around"} ${monthName(end, lang)})`;
  };

  for (const cc of cal.crops) {
    const crop = bySlug.get(cc.slug)!;
    const p = crop.params as SeasonalCropParams;
    const tender = p.frost === "tender" || p.frost === "very_tender";
    const options: [SowNowItem["action"], MonthQuality | undefined][] = [
      ["direct", cc.directSow[month]],
      ["transplant", cc.transplant[month]],
      ["seedbed", cc.seedbedSow[month]],
    ];
    const found = options.find(([, q]) => q);
    if (!found) continue;
    const [action, quality] = found as [SowNowItem["action"], MonthQuality];
    let caution: string | null = null;
    if (tender && action !== "seedbed" && minForecast !== null && minForecast <= p.killTempC + 2) caution = es ? "Heladas o frío previstos esta semana: espera unos días." : "Frost or cold forecast this week: wait a few days.";
    if (p.heatLimitC !== null && maxForecast !== null && maxForecast > p.heatLimitC + 3) caution = es ? "Calor extremo previsto: protege la siembra." : "Extreme heat forecast: protect the planting.";
    const why =
      action === "seedbed"
        ? es
          ? `Siembra en semillero protegido (18–24 °C) para trasplantar dentro de ~${p.weeksInSeedbed} semanas, cuando el clima exterior lo permita.`
          : `Sow in a protected seed tray (18–24 °C) to transplant in ~${p.weeksInSeedbed} weeks when outdoor conditions allow.`
        : es
          ? `Media de ${monthName(month, lang)} ≈ ${m.tMean} °C: ${action === "direct" ? `dentro del rango de germinación (${p.germ.min}–${p.germ.max} °C) y ` : ""}las temperaturas de los próximos meses se ajustan a su ciclo${p.frost === "hardy" || p.frost === "very_hardy" ? " (tolera el frío)" : " sin heladas previstas por el clima"}.`
          : `${monthName(month, lang)} mean ≈ ${m.tMean} °C: ${action === "direct" ? `within germination range (${p.germ.min}–${p.germ.max} °C) and ` : ""}the coming months suit its cycle${p.frost === "hardy" || p.frost === "very_hardy" ? " (cold tolerant)" : " with no frost expected from the climate record"}.`;
    items.push({
      slug: crop.slug,
      name: crop.names[lang],
      scientificName: crop.scientificName,
      category: crop.category,
      action,
      quality,
      why,
      harvest: harvestText(crop),
      conditions: {
        sun: p.sun,
        water: p.water,
        spacing: p.spacingCm ? `${p.spacingCm[0]} × ${p.spacingCm[1]} cm` : null,
        soil: p.soil[lang],
      },
      difficulty: p.difficulty,
      caution,
    });
  }
  for (const ps of cal.perennials) {
    if (ps.verdict === "unsuitable" || !ps.plantingMonths.includes(month)) continue;
    const crop = bySlug.get(ps.slug)!;
    if (crop.params.kind !== "perennial") continue;
    const p = crop.params;
    items.push({
      slug: crop.slug,
      name: crop.names[lang],
      scientificName: crop.scientificName,
      category: crop.category,
      action: "plant",
      quality: ps.verdict === "suitable" ? "optimal" : "possible",
      why: ps.reasons.join(" "),
      harvest: es ? `Primera fruta en ${p.yearsToFruit[0]}–${p.yearsToFruit[1]} años` : `First fruit in ${p.yearsToFruit[0]}–${p.yearsToFruit[1]} years`,
      conditions: { sun: p.sun, water: p.water, spacing: `${p.spacingM[0]}–${p.spacingM[1]} m`, soil: p.soil[lang] },
      difficulty: p.difficulty,
      caution: null,
    });
  }

  const beginner = opts.experience === "BEGINNER";
  const diffRank = { easy: 0, moderate: 1, hard: 2 } as Record<string, number>;
  items.sort(
    (a, b) =>
      Number(!!a.caution) - Number(!!b.caution) ||
      (a.quality === b.quality ? 0 : a.quality === "optimal" ? -1 : 1) ||
      ACTION_RANK[a.action] - ACTION_RANK[b.action] ||
      (beginner ? diffRank[a.difficulty] - diffRank[b.difficulty] : 0) ||
      a.name.localeCompare(b.name),
  );

  const alternatives: string[] = [];
  const outdoorNow = items.filter((i) => i.action !== "seedbed").length;
  if (outdoorNow < 3) {
    alternatives.push(es ? "Pocas siembras al aire libre este mes: aprovecha semilleros protegidos en interior con luz abundante." : "Few outdoor sowings this month: use protected indoor seed trays with plenty of light.");
    alternatives.push(es ? "Cultivos de interior: microbrotes, germinados y aromáticas en alféizar soleado." : "Indoor options: microgreens, sprouts and herbs on a sunny windowsill.");
    const greenhouse = cal.crops.filter((c) => c.greenhouseOnly.includes(month)).map((c) => bySlug.get(c.slug)!.names[lang]);
    if (greenhouse.length) alternatives.push((es ? "Con invernadero o túnel: " : "With a greenhouse or tunnel: ") + greenhouse.slice(0, 6).join(", ") + ".");
    const next = [1, 2, 3].map((k) => ((month - 1 + k) % 12) + 1).find((mm) => cal.months[mm - 1].directSow.length + cal.months[mm - 1].transplant.length >= 3);
    if (next) alternatives.push(es ? `Mejor ventana próxima: ${monthName(next, lang)}.` : `Next good window: ${monthName(next, lang)}.`);
  }
  return { month, items, alternatives, warnings };
}

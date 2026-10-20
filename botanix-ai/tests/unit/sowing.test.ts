import { describe, expect, it } from "vitest";
import { CROPS, CROP_BY_SLUG } from "@/lib/sowing/crops";
import { cropCalendar, perennialSuitability } from "@/lib/sowing/engine";
import { buildCalendar, whatToSowNow } from "@/lib/sowing/calendar";
import { estimateChill } from "@/lib/sowing/chill";
import { summarizeClimate } from "@/lib/climate/classify";
import type { SeasonalCropParams } from "@/lib/sowing/types";
import { fixtureClimate, mirrorToSouth } from "../helpers/climates";

const cal = async (city: "madrid" | "burgos" | "bogota", slug: string) => {
  const c = await fixtureClimate(city);
  return cropCalendar(CROP_BY_SLUG.get(slug)!, c.months, c.summary, c.lat);
};

describe("calidad: recomendaciones climáticas coherentes", () => {
  it("nunca recomienda sembrar o trasplantar al aire libre cultivos sensibles en meses con heladas frecuentes", async () => {
    for (const city of ["madrid", "burgos", "bogota"] as const) {
      const c = await fixtureClimate(city);
      for (const crop of CROPS.filter((x) => x.params.kind === "seasonal")) {
        const p = crop.params as SeasonalCropParams;
        if (p.frost !== "tender" && p.frost !== "very_tender") continue;
        const k = cropCalendar(crop, c.months, c.summary, c.lat);
        for (const m of [...Object.keys(k.directSow), ...Object.keys(k.transplant)].map(Number)) {
          const month = c.months[m - 1];
          expect(month.frostDays, `${crop.slug} en ${city}, mes ${m}`).toBeLessThan(0.5);
          expect(month.absMin, `${crop.slug} en ${city}, mes ${m}`).toBeGreaterThan(p.killTempC);
        }
      }
    }
  });
  it("la cosecha de cultivos sensibles no cae en meses en que la helada los mata", async () => {
    const c = await fixtureClimate("burgos");
    const k = cropCalendar(CROP_BY_SLUG.get("tomato")!, c.months, c.summary, c.lat);
    for (const m of k.harvest) expect(c.months[m - 1].frostDays).toBeLessThan(0.5);
  });
  it("Madrid: tomate trasplantado a finales de primavera, nunca en invierno", async () => {
    const k = await cal("madrid", "tomato");
    expect(k.transplant[5]).toBeDefined();
    expect(k.transplant[1]).toBeUndefined();
    expect(k.transplant[12]).toBeUndefined();
    expect(Object.keys(k.seedbedSow).map(Number).every((m) => m >= 2 && m <= 7)).toBe(true);
  });
  it("Burgos (Castilla y León) tiene una ventana de tomate más tardía y corta que Madrid", async () => {
    const madrid = Object.keys((await cal("madrid", "tomato")).transplant).map(Number);
    const burgos = Object.keys((await cal("burgos", "tomato")).transplant).map(Number);
    expect(Math.min(...burgos)).toBeGreaterThan(Math.min(...madrid));
    expect(burgos.length).toBeLessThan(madrid.length);
  });
  it("Bogotá (2600 m): el tomate solo es viable bajo invernadero; la lechuga y la arveja todo el año", async () => {
    const tomato = await cal("bogota", "tomato");
    expect(Object.keys(tomato.transplant)).toHaveLength(0);
    expect(tomato.greenhouseOnly.length).toBeGreaterThan(0);
    expect(Object.keys((await cal("bogota", "lettuce")).directSow)).toHaveLength(12);
    expect(Object.keys((await cal("bogota", "pea")).directSow)).toHaveLength(12);
  });
  it("el ajo necesita un periodo frío: viable en otoño-invierno en Madrid y no en Bogotá", async () => {
    const madrid = (await cal("madrid", "garlic")).directSow;
    expect(madrid[10]).toBeDefined();
    expect(madrid[5]).toBeUndefined();
    expect(Object.keys((await cal("bogota", "garlic")).directSow)).toHaveLength(0);
  });
  it("el césped de clima fresco no se siembra en pleno verano mediterráneo", async () => {
    const k = await cal("madrid", "tall_fescue");
    expect(k.directSow[7]).toBeUndefined();
    expect(k.directSow[9] ?? k.directSow[10]).toBeDefined();
  });
  it("el hemisferio sur desplaza el calendario seis meses (no depende del nombre del mes)", async () => {
    const north = await fixtureClimate("madrid");
    const southMonths = mirrorToSouth(north.months);
    const south = summarizeClimate(southMonths, -north.lat);
    const n = cropCalendar(CROP_BY_SLUG.get("tomato")!, north.months, north.summary, north.lat);
    const s = cropCalendar(CROP_BY_SLUG.get("tomato")!, southMonths, south, -north.lat);
    const shift = (m: number) => ((m + 5) % 12) + 1;
    expect(Object.keys(s.transplant).map(Number).sort((a, b) => a - b)).toEqual(Object.keys(n.transplant).map(Number).map(shift).sort((a, b) => a - b));
  });
});

describe("frutales", () => {
  it("estima más frío invernal en Burgos que en Madrid y casi ninguno en Bogotá", async () => {
    const [b, m, g] = await Promise.all([fixtureClimate("burgos"), fixtureClimate("madrid"), fixtureClimate("bogota")]);
    expect(estimateChill(b.months)).toBeGreaterThan(estimateChill(m.months));
    expect(estimateChill(g.months)).toBeLessThan(200);
  });
  it("mango no apto en Burgos; manzano apto en Burgos; tomate de árbol apto en Bogotá", async () => {
    const b = await fixtureClimate("burgos");
    const g = await fixtureClimate("bogota");
    expect(perennialSuitability(CROP_BY_SLUG.get("mango")!, b.months, b.summary).verdict).toBe("unsuitable");
    expect(perennialSuitability(CROP_BY_SLUG.get("apple")!, b.months, b.summary).verdict).toBe("suitable");
    expect(perennialSuitability(CROP_BY_SLUG.get("tree_tomato")!, g.months, g.summary).verdict).toBe("suitable");
  });
  it("un frutal no apto no recibe meses de plantación", async () => {
    const b = await fixtureClimate("burgos");
    expect(perennialSuitability(CROP_BY_SLUG.get("orange")!, b.months, b.summary).plantingMonths).toEqual([]);
  });
});

describe("¿Qué puedo sembrar hoy?", () => {
  it("explica cada recomendación y aplaza cultivos sensibles si se prevé helada", async () => {
    const c = await fixtureClimate("madrid");
    const forecast = { current: null, daily: [{ date: "2026-05-01", tMin: -1, tMax: 14, precipMm: 0 }], provider: "test", attribution: "", retrievedAt: "", isTestFixture: true };
    const r = whatToSowNow(c.months, c.summary, c.lat, 5, { forecast });
    expect(r.items.length).toBeGreaterThan(3);
    for (const it of r.items) expect(it.why.length).toBeGreaterThan(20);
    expect(r.warnings.join(" ")).toMatch(/-1 °C/);
    const tomato = r.items.find((i) => i.slug === "tomato" && i.action !== "seedbed");
    if (tomato) expect(tomato.caution).not.toBeNull();
  });
  it("en meses desfavorables propone alternativas", async () => {
    const c = await fixtureClimate("burgos");
    const r = whatToSowNow(c.months, c.summary, c.lat, 1);
    expect(r.alternatives.length).toBeGreaterThan(0);
  });
  it("el calendario mensual incluye protección en meses de helada y tareas de poda", async () => {
    const c = await fixtureClimate("burgos");
    const full = buildCalendar(c.months, c.summary, c.lat);
    expect(full.months[0].protect.length).toBeGreaterThan(0);
    expect(full.months.some((m) => m.prune.length > 0)).toBe(true);
  });
});

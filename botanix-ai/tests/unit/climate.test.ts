import { describe, expect, it } from "vitest";
import { koppen, usdaZone, summarizeClimate } from "@/lib/climate/classify";
import { dailyToMonthlyNormals } from "@/lib/climate/aggregate";
import { OpenMeteoProvider } from "@/lib/climate/open-meteo";
import { AppError } from "@/lib/errors";
import { fixtureClimate, synthetic } from "../helpers/climates";

describe("clasificación climática", () => {
  it("clasifica los climas de prueba de forma coherente con la literatura", async () => {
    expect((await fixtureClimate("madrid")).summary.koppen).toMatch(/^(BSk|Csa)$/);
    expect((await fixtureClimate("burgos")).summary.koppen).toMatch(/^C[fs]b$/);
    expect((await fixtureClimate("bogota")).summary.koppen).toBe("Cfb");
  });
  it("distingue selva tropical y desierto cálido", () => {
    expect(koppen(synthetic({ precipMm: 250 }), 2)).toBe("Af");
    expect(koppen(synthetic({ precipMm: 2 }), 25)).toBe("BWh");
  });
  it("Bogotá es un clima sin heladas y con todo el año como temporada de crecimiento", async () => {
    const { summary } = await fixtureClimate("bogota");
    expect(summary.frostRiskMonths).toEqual([]);
    expect(summary.growingMonths).toHaveLength(12);
    expect(summary.hemisphere).toBe("north");
  });
  it("calcula la zona USDA a partir de la mínima extrema", () => {
    expect(usdaZone(-12.2)).toBe("8a");
    expect(usdaZone(-3)).toBe("9b");
    expect(usdaZone(5)).toBe("11a");
  });
  it("identifica el hemisferio por la latitud, no por el mes", () => {
    expect(summarizeClimate(synthetic({}), -33).hemisphere).toBe("south");
  });
});

describe("agregación de datos diarios", () => {
  it("convierte una serie diaria en normales mensuales con heladas y extremos", () => {
    const time: string[] = [], tMax: number[] = [], tMin: number[] = [], tMean: number[] = [], precip: number[] = [];
    for (const year of [2020, 2021]) {
      for (let m = 0; m < 12; m++) {
        const days = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
        for (let d = 1; d <= days; d++) {
          time.push(`${year}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
          const cold = m === 0 && d <= 3; // 3 días de helada en enero
          tMin.push(cold ? -2 : 5); tMax.push(15); tMean.push(cold ? 6 : 10); precip.push(1);
        }
      }
    }
    const months = dailyToMonthlyNormals({ time, tMax, tMin, tMean, precip });
    expect(months[0].frostDays).toBe(3);
    expect(months[0].absMin).toBe(-2);
    expect(months[1].precipMm).toBeCloseTo(28.5, 0);
    expect(months[5].frostDays).toBe(0);
  });
});

describe("adaptador Open-Meteo", () => {
  it("interpreta la geocodificación", async () => {
    const fetcher = async () => new Response(JSON.stringify({ results: [{ name: "Medellín", latitude: 6.25, longitude: -75.56, elevation: 1495, country_code: "CO", country: "Colombia", admin1: "Antioquia" }] }));
    const places = await new OpenMeteoProvider(fetcher).searchPlaces("Medellin", "es");
    expect(places[0]).toMatchObject({ name: "Medellín", countryCode: "CO", region: "Antioquia", elevationM: 1495 });
  });
  it("envía la elevación y usa los últimos 10 años completos", async () => {
    let url = "";
    const days = (y: number) => Array.from({ length: 365 }, (_, i) => new Date(Date.UTC(y, 0, 1 + i)).toISOString().slice(0, 10));
    const time = Array.from({ length: 10 }, (_, k) => days(2016 + k)).flat();
    const fetcher = async (u: string) => {
      url = u;
      return new Response(JSON.stringify({ latitude: 4.6, longitude: -74.1, elevation: 2600, daily: { time, temperature_2m_max: time.map(() => 19), temperature_2m_min: time.map(() => 7), temperature_2m_mean: time.map(() => 13), precipitation_sum: time.map(() => 2) } }));
    };
    const n = await new OpenMeteoProvider(fetcher, () => new Date("2026-10-20T00:00:00Z")).getNormals(4.6, -74.1, 2600);
    expect(url).toContain("elevation=2600");
    expect(url).toContain("start_date=2016-01-01");
    expect(url).toContain("end_date=2025-12-31");
    expect(n.months).toHaveLength(12);
    expect(n.isTestFixture).toBe(false);
    expect(n.attribution).toMatch(/Open-Meteo/);
  });
  it("convierte fallos de red y HTTP en errores claros", async () => {
    await expect(new OpenMeteoProvider(async () => { throw new Error("down"); }).searchPlaces("x", "es")).rejects.toMatchObject({ code: "UPSTREAM_UNAVAILABLE" });
    await expect(new OpenMeteoProvider(async () => new Response("", { status: 500 })).getForecast(1, 1)).rejects.toBeInstanceOf(AppError);
  });
});

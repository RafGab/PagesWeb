import { z } from "zod";
import { AppError } from "@/lib/errors";
import { dailyToMonthlyNormals } from "./aggregate";
import type { ClimateNormals, ClimateProvider, Forecast, Place } from "./types";

// Open-Meteo: datos CC BY 4.0 con atribución. La API gratuita es para uso no comercial;
// el uso comercial requiere plan de pago (https://open-meteo.com/en/pricing).
const ATTRIBUTION = "Datos meteorológicos: Open-Meteo.com (CC BY 4.0), reanálisis ERA5/ERA5-Land de Copernicus";
const NORMAL_YEARS = 10;

const GeoResult = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        elevation: z.number().optional(),
        country_code: z.string().optional(),
        country: z.string().optional(),
        admin1: z.string().optional(),
        admin2: z.string().optional(),
        timezone: z.string().optional(),
        postcodes: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

const nums = z.array(z.number().nullable());
const ArchiveResult = z.object({
  latitude: z.number(),
  longitude: z.number(),
  elevation: z.number().optional(),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: nums,
    temperature_2m_min: nums,
    temperature_2m_mean: nums,
    precipitation_sum: nums,
    sunshine_duration: nums.optional(),
    et0_fao_evapotranspiration: nums.optional(),
  }),
});

const ForecastResult = z.object({
  current: z
    .object({
      time: z.string(),
      temperature_2m: z.number(),
      relative_humidity_2m: z.number().nullable().optional(),
      precipitation: z.number().nullable().optional(),
      wind_speed_10m: z.number().nullable().optional(),
    })
    .optional(),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_sum: z.array(z.number()),
  }),
});

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export class OpenMeteoProvider implements ClimateProvider {
  readonly id = "open-meteo";
  constructor(
    private fetcher: FetchLike = fetch,
    private now: () => Date = () => new Date(),
  ) {}

  private async getJson(url: string, timeoutMs = 20_000): Promise<unknown> {
    let res: Response;
    try {
      res = await this.fetcher(url, { signal: AbortSignal.timeout(timeoutMs), headers: { accept: "application/json" } });
    } catch {
      throw new AppError("UPSTREAM_UNAVAILABLE", "No se pudo contactar con el servicio climático (Open-Meteo).");
    }
    if (!res.ok) throw new AppError("UPSTREAM_UNAVAILABLE", `El servicio climático respondió ${res.status}.`);
    return res.json();
  }

  async searchPlaces(query: string, language: string): Promise<Place[]> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=${encodeURIComponent(language)}&format=json`;
    const data = GeoResult.parse(await this.getJson(url));
    return (data.results ?? []).map((r) => ({
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      elevationM: r.elevation ?? null,
      countryCode: r.country_code ?? "",
      countryName: r.country ?? "",
      region: r.admin1 ?? null,
      subregion: r.admin2 ?? null,
      timezone: r.timezone ?? null,
      postcodes: r.postcodes ?? [],
    }));
  }

  async getNormals(lat: number, lon: number, elevationM?: number | null): Promise<ClimateNormals> {
    // Últimos 10 años naturales completos.
    const endYear = this.now().getUTCFullYear() - 1;
    const start = `${endYear - NORMAL_YEARS + 1}-01-01`;
    const end = `${endYear}-12-31`;
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      start_date: start,
      end_date: end,
      daily: "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,sunshine_duration,et0_fao_evapotranspiration",
      timezone: "auto",
    });
    // La elevación permite a Open-Meteo corregir la temperatura por altitud (clave en montaña y pisos térmicos).
    if (elevationM != null) params.set("elevation", String(Math.round(elevationM)));
    const url = `https://archive-api.open-meteo.com/v1/archive?${params}`;
    const data = ArchiveResult.parse(await this.getJson(url, 45_000));
    const months = dailyToMonthlyNormals({
      time: data.daily.time,
      tMax: data.daily.temperature_2m_max,
      tMin: data.daily.temperature_2m_min,
      tMean: data.daily.temperature_2m_mean,
      precip: data.daily.precipitation_sum,
      sunshineSec: data.daily.sunshine_duration,
      et0: data.daily.et0_fao_evapotranspiration,
    });
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      elevationM: data.elevation ?? elevationM ?? null,
      periodStart: start,
      periodEnd: end,
      months,
      provider: this.id,
      attribution: ATTRIBUTION,
      sourceUrl: "https://open-meteo.com/en/docs/historical-weather-api",
      retrievedAt: this.now().toISOString(),
      isTestFixture: false,
      limitations:
        "Promedios de reanálisis en rejilla de 9–25 km corregidos por altitud: no capturan microclimas (patios, laderas, heladas de valle, islas de calor urbanas). Periodo de 10 años, no una normal oficial de 30 años.",
    };
  }

  async getForecast(lat: number, lon: number): Promise<Forecast> {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
      daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
      timezone: "auto",
      forecast_days: "7",
    });
    const data = ForecastResult.parse(await this.getJson(`https://api.open-meteo.com/v1/forecast?${params}`));
    return {
      current: data.current
        ? {
            time: data.current.time,
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m ?? null,
            precipitation: data.current.precipitation ?? null,
            windKmh: data.current.wind_speed_10m ?? null,
          }
        : null,
      daily: data.daily.time.map((date, i) => ({
        date,
        tMin: data.daily.temperature_2m_min[i],
        tMax: data.daily.temperature_2m_max[i],
        precipMm: data.daily.precipitation_sum[i],
      })),
      provider: this.id,
      attribution: ATTRIBUTION,
      retrievedAt: this.now().toISOString(),
      isTestFixture: false,
    };
  }
}

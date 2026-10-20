import "server-only";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { OpenMeteoProvider } from "./open-meteo";
import { FixtureClimateProvider } from "./fixture";
import { summarizeClimate, type ClimateSummary } from "./classify";
import type { ClimateNormals, ClimateProvider, Forecast } from "./types";

const NORMALS_TTL_DAYS = 180;
const FORECAST_TTL_MIN = 60;

let provider: ClimateProvider | null = null;
export function climateProvider(): ClimateProvider {
  if (provider) return provider;
  provider = env().CLIMATE_PROVIDER === "fixture" ? new FixtureClimateProvider() : new OpenMeteoProvider();
  return provider;
}
export function setClimateProvider(p: ClimateProvider | null) {
  provider = p;
}

// Las coordenadas se redondean a 2 decimales (~1 km): sin ubicación precisa y con caché compartida.
export const roundCoord = (x: number) => Math.round(x * 100) / 100;
const cellKey = (lat: number, lon: number, elev?: number | null) => `${roundCoord(lat)},${roundCoord(lon)},${elev == null ? "" : Math.round(elev / 50) * 50}`;

async function cached<T>(key: string, kind: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const p = climateProvider();
  const hit = await db.climateCache.findUnique({ where: { cellKey_kind_provider: { cellKey: key, kind, provider: p.id } } });
  if (hit && hit.expiresAt > new Date()) return hit.payload as T;
  const value = await load();
  const expiresAt = new Date(Date.now() + ttlMs);
  await db.climateCache.upsert({
    where: { cellKey_kind_provider: { cellKey: key, kind, provider: p.id } },
    create: { cellKey: key, kind, provider: p.id, payload: value as object, expiresAt },
    update: { payload: value as object, expiresAt, fetchedAt: new Date() },
  });
  return value;
}

export interface ClimateContext {
  normals: ClimateNormals;
  summary: ClimateSummary;
}

export async function getClimateContext(lat: number, lon: number, elevationM?: number | null): Promise<ClimateContext> {
  const normals = await cached(cellKey(lat, lon, elevationM), "normals", NORMALS_TTL_DAYS * 86_400_000, () =>
    climateProvider().getNormals(roundCoord(lat), roundCoord(lon), elevationM),
  );
  return { normals, summary: summarizeClimate(normals.months, lat) };
}

export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  return cached(cellKey(lat, lon), "forecast", FORECAST_TTL_MIN * 60_000, () => climateProvider().getForecast(roundCoord(lat), roundCoord(lon)));
}

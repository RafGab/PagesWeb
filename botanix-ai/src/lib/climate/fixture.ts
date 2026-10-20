import type { ClimateNormals, ClimateProvider, Forecast, MonthlyNormal, Place } from "./types";

// ⚠️ DATOS DE PRUEBA. Valores aproximados escritos a mano para pruebas automatizadas y
// demostraciones sin red. No son datos oficiales y la interfaz los marca como tales.
type Row = [tMean: number, tMin: number, tMax: number, precip: number, frostDays: number, absMin: number];

const FIXTURES: Record<string, { place: Place; rows: Row[] }> = {
  madrid: {
    place: { name: "Madrid", latitude: 40.42, longitude: -3.7, elevationM: 657, countryCode: "ES", countryName: "España", region: "Comunidad de Madrid", subregion: "Madrid", timezone: "Europe/Madrid", postcodes: ["28001"] },
    rows: [
      [6.3, 2.7, 9.8, 33, 3, -2.5], [7.9, 3.7, 12.0, 35, 1.5, -1.5], [11.2, 6.2, 16.3, 36, 0.3, 0], [13.1, 8.0, 18.2, 46, 0, 2.5],
      [17.2, 11.6, 22.8, 48, 0, 6], [22.7, 16.4, 29.0, 20, 0, 10.5], [26.0, 19.4, 32.6, 11, 0, 14], [25.6, 19.2, 31.9, 10, 0, 14],
      [21.0, 15.6, 26.4, 24, 0, 10], [15.4, 11.0, 19.8, 60, 0, 5], [9.9, 6.2, 13.6, 55, 0.5, 0.5], [7.0, 3.6, 10.4, 48, 2.5, -2],
    ],
  },
  burgos: {
    place: { name: "Burgos", latitude: 42.34, longitude: -3.7, elevationM: 859, countryCode: "ES", countryName: "España", region: "Castilla y León", subregion: "Burgos", timezone: "Europe/Madrid", postcodes: ["09001"] },
    rows: [
      [3.0, -1.0, 7.2, 45, 15, -8], [4.2, -0.6, 9.3, 35, 13, -7], [7.0, 1.1, 13.1, 35, 8, -5], [9.0, 3.0, 15.0, 55, 3, -2],
      [12.6, 6.0, 19.2, 62, 0.5, 1], [17.0, 9.5, 24.6, 40, 0, 5], [20.0, 11.8, 28.3, 22, 0, 7.5], [20.1, 11.9, 28.4, 22, 0, 7.5],
      [16.6, 9.2, 24.0, 33, 0.3, 4], [12.0, 6.0, 18.1, 57, 2, 0], [6.6, 2.0, 11.3, 58, 8, -4], [3.8, -0.3, 7.9, 57, 14, -7],
    ],
  },
  bogota: {
    place: { name: "Bogotá", latitude: 4.61, longitude: -74.08, elevationM: 2600, countryCode: "CO", countryName: "Colombia", region: "Bogotá D.C.", subregion: null, timezone: "America/Bogota", postcodes: ["110111"] },
    rows: [
      [13.8, 6.8, 19.8, 40, 0.3, 1.5], [14.1, 7.3, 19.9, 55, 0.2, 2], [14.3, 8.0, 19.8, 80, 0, 3.5], [14.3, 8.6, 19.4, 115, 0, 5],
      [14.3, 8.7, 19.2, 100, 0, 5.5], [14.0, 8.3, 18.6, 55, 0, 5], [13.7, 7.8, 18.5, 45, 0, 4.5], [13.8, 7.6, 18.8, 50, 0, 4],
      [13.9, 7.4, 19.1, 65, 0, 3.5], [14.0, 8.1, 19.0, 120, 0, 4.5], [14.1, 8.4, 18.9, 110, 0, 5], [13.9, 7.5, 19.2, 65, 0.2, 2.5],
    ],
  },
};

function nearest(lat: number, lon: number) {
  let best = FIXTURES.madrid;
  let bestD = Infinity;
  for (const f of Object.values(FIXTURES)) {
    const d = (f.place.latitude - lat) ** 2 + (f.place.longitude - lon) ** 2;
    if (d < bestD) [best, bestD] = [f, d];
  }
  return best;
}

export class FixtureClimateProvider implements ClimateProvider {
  readonly id = "fixture";

  async searchPlaces(query: string): Promise<Place[]> {
    const q = query.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    return Object.entries(FIXTURES)
      .filter(([k]) => k.includes(q) || q.includes(k))
      .map(([, f]) => f.place);
  }

  async getNormals(lat: number, lon: number): Promise<ClimateNormals> {
    const f = nearest(lat, lon);
    const months: MonthlyNormal[] = f.rows.map(([tMean, tMin, tMax, precipMm, frostDays, absMin], i) => ({
      month: i + 1, tMean, tMin, tMax, precipMm, frostDays, absMin,
      absMax: tMax + 6, hotDays: tMax > 30 ? 3 : 0, sunshineHours: null, et0Mm: null,
    }));
    return {
      latitude: f.place.latitude, longitude: f.place.longitude, elevationM: f.place.elevationM,
      periodStart: "fixture", periodEnd: "fixture", months, provider: this.id,
      attribution: "DATOS DE PRUEBA (valores aproximados, no oficiales)", sourceUrl: "", retrievedAt: new Date().toISOString(),
      isTestFixture: true, limitations: "Datos de prueba escritos a mano. No usar para decisiones reales.",
    };
  }

  async getForecast(lat: number, lon: number): Promise<Forecast> {
    const normals = await this.getNormals(lat, lon);
    const m = normals.months[new Date().getMonth()];
    const today = new Date();
    return {
      current: { temperature: m.tMean, humidity: null, precipitation: null, windKmh: null, time: today.toISOString() },
      daily: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(today.getTime() + i * 86_400_000).toISOString().slice(0, 10), tMin: m.tMin, tMax: m.tMax, precipMm: 0,
      })),
      provider: this.id, attribution: "DATOS DE PRUEBA", retrievedAt: today.toISOString(), isTestFixture: true,
    };
  }
}

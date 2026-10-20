export interface Place {
  name: string;
  latitude: number;
  longitude: number;
  elevationM: number | null;
  countryCode: string;
  countryName: string;
  region: string | null; // admin1: comunidad, estado, departamento…
  subregion: string | null; // admin2: provincia, condado…
  timezone: string | null;
  postcodes: string[];
}

export interface MonthlyNormal {
  month: number; // 1–12
  tMean: number; // °C
  tMin: number; // media de mínimas diarias
  tMax: number; // media de máximas diarias
  absMin: number; // media de la mínima más baja del mes en el periodo
  absMax: number; // media de la máxima más alta del mes
  precipMm: number; // total mensual medio
  frostDays: number; // días medios con mínima < 0 °C
  hotDays: number; // días medios con máxima > 35 °C
  sunshineHours: number | null;
  et0Mm: number | null; // evapotranspiración de referencia FAO-56
}

export interface ClimateNormals {
  latitude: number;
  longitude: number;
  elevationM: number | null;
  periodStart: string;
  periodEnd: string;
  months: MonthlyNormal[];
  provider: string;
  attribution: string;
  sourceUrl: string;
  retrievedAt: string;
  isTestFixture: boolean;
  limitations: string;
}

export interface DailyForecast {
  date: string;
  tMin: number;
  tMax: number;
  precipMm: number;
}

export interface Forecast {
  current: { temperature: number; humidity: number | null; precipitation: number | null; windKmh: number | null; time: string } | null;
  daily: DailyForecast[];
  provider: string;
  attribution: string;
  retrievedAt: string;
  isTestFixture: boolean;
}

export interface ClimateProvider {
  readonly id: string;
  searchPlaces(query: string, language: string): Promise<Place[]>;
  getNormals(lat: number, lon: number, elevationM?: number | null): Promise<ClimateNormals>;
  getForecast(lat: number, lon: number): Promise<Forecast>;
}

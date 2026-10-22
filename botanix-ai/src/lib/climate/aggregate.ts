import type { MonthlyNormal } from "./types";

export interface DailySeries {
  time: string[];
  tMax: (number | null)[];
  tMin: (number | null)[];
  tMean: (number | null)[];
  precip: (number | null)[];
  sunshineSec?: (number | null)[];
  et0?: (number | null)[];
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const round1 = (x: number) => Math.round(x * 10) / 10;

// Convierte una serie diaria de varios años en normales mensuales.
export function dailyToMonthlyNormals(d: DailySeries): MonthlyNormal[] {
  // Agrupa por (año, mes) para obtener totales y extremos mensuales, luego promedia entre años.
  type Acc = { tMax: number[]; tMin: number[]; tMean: number[]; precip: number[]; sun: number[]; et0: number[] };
  const byYearMonth = new Map<string, Acc>();
  d.time.forEach((t, i) => {
    const key = t.slice(0, 7);
    const acc = byYearMonth.get(key) ?? { tMax: [], tMin: [], tMean: [], precip: [], sun: [], et0: [] };
    const push = (arr: number[], v: number | null | undefined) => {
      if (v !== null && v !== undefined && Number.isFinite(v)) arr.push(v);
    };
    push(acc.tMax, d.tMax[i]);
    push(acc.tMin, d.tMin[i]);
    push(acc.tMean, d.tMean[i] ?? (d.tMax[i] != null && d.tMin[i] != null ? (d.tMax[i]! + d.tMin[i]!) / 2 : null));
    push(acc.precip, d.precip[i]);
    push(acc.sun, d.sunshineSec?.[i]);
    push(acc.et0, d.et0?.[i]);
    byYearMonth.set(key, acc);
  });

  const months: MonthlyNormal[] = [];
  for (let m = 1; m <= 12; m++) {
    const mm = String(m).padStart(2, "0");
    // Solo meses con al menos 25 días de datos para no sesgar totales.
    const entries = [...byYearMonth.entries()].filter(([k, a]) => k.endsWith(`-${mm}`) && a.tMin.length >= 25);
    if (!entries.length) throw new Error(`Sin datos suficientes para el mes ${m}`);
    const list = entries.map(([, a]) => a);
    months.push({
      month: m,
      tMean: round1(avg(list.map((a) => avg(a.tMean)))),
      tMin: round1(avg(list.map((a) => avg(a.tMin)))),
      tMax: round1(avg(list.map((a) => avg(a.tMax)))),
      absMin: round1(avg(list.map((a) => Math.min(...a.tMin)))),
      absMax: round1(avg(list.map((a) => Math.max(...a.tMax)))),
      precipMm: round1(avg(list.map((a) => a.precip.reduce((x, y) => x + y, 0)))),
      frostDays: round1(avg(list.map((a) => a.tMin.filter((v) => v < 0).length))),
      hotDays: round1(avg(list.map((a) => a.tMax.filter((v) => v > 35).length))),
      sunshineHours: list.every((a) => a.sun.length) ? Math.round(avg(list.map((a) => a.sun.reduce((x, y) => x + y, 0) / 3600))) : null,
      et0Mm: list.every((a) => a.et0.length) ? round1(avg(list.map((a) => a.et0.reduce((x, y) => x + y, 0)))) : null,
    });
  }
  return months;
}

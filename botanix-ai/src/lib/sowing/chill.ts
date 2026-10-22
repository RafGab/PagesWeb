import type { MonthlyNormal } from "@/lib/climate/types";

const DAYS = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Pesos horarios del modelo Utah (Richardson et al., 1974).
function utahWeight(t: number) {
  if (t < 1.4) return 0;
  if (t < 2.5) return 0.5;
  if (t < 9.2) return 1;
  if (t < 12.5) return 0.5;
  if (t < 16) return 0;
  if (t < 18) return -0.5;
  return -1;
}

/**
 * Unidades de frío Utah esperadas por día, suponiendo que la temperatura horaria sigue
 * una sinusoide entre la mínima y la máxima medias del mes. Es una aproximación: no
 * captura la variabilidad entre días ni las olas de frío o calor.
 */
export function dailyUtahUnits(tMin: number, tMax: number, samples = 48) {
  const mean = (tMin + tMax) / 2;
  const amp = (tMax - tMin) / 2;
  let total = 0;
  for (let i = 0; i < samples; i++) total += utahWeight(mean + amp * Math.sin((2 * Math.PI * i) / samples));
  return (total * 24) / samples;
}

/** Fracción del tiempo con temperatura en [lo, hi] para una sinusoide entre tMin y tMax. */
function fractionBetween(tMin: number, tMax: number, lo: number, hi: number) {
  const mean = (tMin + tMax) / 2;
  const amp = Math.max(0.01, (tMax - tMin) / 2);
  const below = (x: number) => (x <= mean - amp ? 0 : x >= mean + amp ? 1 : 0.5 + Math.asin((x - mean) / amp) / Math.PI);
  return Math.max(0, below(hi) - below(lo));
}

/** Horas-frío clásicas (0–7,2 °C) estimadas por mes con el mismo supuesto sinusoidal. */
export function estimateChillHours(months: MonthlyNormal[]) {
  return Math.round(months.reduce((acc, m, i) => acc + fractionBetween(m.tMin, m.tMax, 0, 7.2) * 24 * DAYS[i], 0));
}

/** Acumulación invernal estimada: mejor ventana continua (circular) de meses con suma positiva. */
export function estimateUtahUnits(months: MonthlyNormal[]) {
  const monthly = months.map((m, i) => dailyUtahUnits(m.tMin, m.tMax) * DAYS[i]);
  // Kadane circular sobre 24 posiciones, limitando la ventana a 12 meses.
  let best = 0;
  for (let start = 0; start < 12; start++) {
    let acc = 0;
    for (let len = 0; len < 12; len++) {
      acc += monthly[(start + len) % 12];
      if (acc > best) best = acc;
    }
  }
  return Math.round(best);
}

/**
 * Estimación conservadora del frío invernal: el mínimo entre horas-frío (0–7,2 °C) y unidades Utah.
 * Las horas-frío sobrestiman el frío útil en climas con días cálidos (trópico de altura) y las
 * unidades Utah con medias mensuales lo sobrestiman en inviernos fríos y regulares.
 */
export function estimateChill(months: MonthlyNormal[]) {
  return Math.min(estimateChillHours(months), estimateUtahUnits(months));
}

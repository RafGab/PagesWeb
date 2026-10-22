"use client";
import { useState } from "react";
import type { MonthlyNormal } from "@/lib/climate/types";
import { useI18n } from "./i18n";

const W = 360, H = 150, PAD = { l: 30, r: 8, t: 10, b: 22 };

// Dos gráficos separados (nunca doble eje): rango de temperaturas y precipitación mensual.
export function ClimateCharts({ months, frostMonths }: { months: MonthlyNormal[]; frostMonths: number[] }) {
  const { t, locale } = useI18n();
  const es = locale === "es";
  const [hover, setHover] = useState<number | null>(null);
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const step = iw / 12;
  const x = (i: number) => PAD.l + i * step + step / 2;

  const tLo = Math.floor(Math.min(...months.map((m) => m.tMin), 0) / 5) * 5;
  const tHi = Math.ceil(Math.max(...months.map((m) => m.tMax)) / 5) * 5;
  const ty = (v: number) => PAD.t + ih - ((v - tLo) / (tHi - tLo)) * ih;
  const pHi = Math.max(50, Math.ceil(Math.max(...months.map((m) => m.precipMm)) / 50) * 50);
  const py = (v: number) => PAD.t + ih - (v / pHi) * ih;
  const tTicks = Array.from({ length: (tHi - tLo) / 5 + 1 }, (_, i) => tLo + i * 5).filter((_, i, a) => a.length <= 6 || i % 2 === 0);
  const pTicks = [0, pHi / 2, pHi];
  const h = hover !== null ? months[hover] : null;

  const Axis = ({ ticks, y, unit }: { ticks: number[]; y: (v: number) => number; unit: string }) => (
    <g>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--viz-grid)" strokeWidth={v === 0 ? 1.5 : 1} />
          <text x={PAD.l - 4} y={y(v) + 3} textAnchor="end" fontSize="9" fill="var(--muted)">{v}{unit}</text>
        </g>
      ))}
      {months.map((m, i) => (
        <text key={m.month} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="var(--muted)">{t.common.months[i][0]}</text>
      ))}
    </g>
  );
  const HitLayer = () => (
    <g>
      {months.map((m, i) => (
        <rect key={m.month} x={PAD.l + i * step} y={PAD.t} width={step} height={ih} fill="transparent"
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} onTouchStart={() => setHover(i)} tabIndex={-1} />
      ))}
      {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + ih} stroke="var(--muted)" strokeDasharray="2 3" pointerEvents="none" />}
    </g>
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <figure>
          <figcaption className="mb-1 text-sm font-semibold">{es ? "Temperatura (mín.–máx. media, °C)" : "Temperature (mean min–max, °C)"}</figcaption>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={es ? "Temperaturas medias mensuales" : "Monthly mean temperatures"}>
            <Axis ticks={tTicks} y={ty} unit="°" />
            {months.map((m, i) => (
              <g key={m.month} pointerEvents="none">
                <rect x={x(i) - 5} y={ty(m.tMax)} width={10} height={Math.max(2, ty(m.tMin) - ty(m.tMax))} rx={4} fill="var(--viz-temp)" opacity={hover === null || hover === i ? 0.85 : 0.35} />
                {frostMonths.includes(m.month) && <text x={x(i)} y={ty(m.tMin) + 11} textAnchor="middle" fontSize="9" fill="var(--viz-rain)">❄</text>}
              </g>
            ))}
            <HitLayer />
          </svg>
        </figure>
        <figure>
          <figcaption className="mb-1 text-sm font-semibold">{es ? "Precipitación (mm/mes)" : "Rainfall (mm/month)"}</figcaption>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={es ? "Precipitación media mensual" : "Monthly mean rainfall"}>
            <Axis ticks={pTicks} y={py} unit="" />
            {months.map((m, i) => (
              <rect key={m.month} x={x(i) - step / 2 + 1} y={py(m.precipMm)} width={step - 2} height={Math.max(0, py(0) - py(m.precipMm))} rx={4} fill="var(--viz-rain)" opacity={hover === null || hover === i ? 0.85 : 0.35} pointerEvents="none" />
            ))}
            <HitLayer />
          </svg>
        </figure>
      </div>
      <p className="min-h-5 text-sm" aria-live="polite">
        {h ? `${t.common.monthsLong[h.month - 1]}: ${h.tMin}–${h.tMax} °C (${es ? "media" : "mean"} ${h.tMean} °C) · ${h.precipMm} mm · ${es ? "días de helada" : "frost days"} ${h.frostDays}` : <span className="muted">{es ? "Toca o pasa el cursor sobre un mes para ver los datos." : "Tap or hover a month to see its values."} ❄ = {t.sow.frost.toLowerCase()}</span>}
      </p>
      <details className="text-sm">
        <summary className="font-semibold text-[var(--accent)] underline">{es ? "Ver tabla de datos" : "View data table"}</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-right tabular-nums">
            <thead><tr className="muted"><th className="text-left">{es ? "Mes" : "Month"}</th><th>Mín</th><th>Media</th><th>Máx</th><th>{es ? "Mín. extrema" : "Abs. min"}</th><th>mm</th><th>{es ? "Heladas (d)" : "Frost (d)"}</th></tr></thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.month} className="border-t border-[var(--line)]"><td className="text-left">{t.common.months[m.month - 1]}</td><td>{m.tMin}</td><td>{m.tMean}</td><td>{m.tMax}</td><td>{m.absMin}</td><td>{m.precipMm}</td><td>{m.frostDays}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, CalendarDays, Download, Sprout, Sun, Droplets, Thermometer, Mountain, TreeDeciduous } from "lucide-react";
import type { SowNowResult, FullCalendar } from "@/lib/sowing/calendar";
import type { ClimateSummary } from "@/lib/climate/classify";
import { KOPPEN_LABELS } from "@/lib/climate/classify";
import type { ClimateNormals, Forecast } from "@/lib/climate/types";
import { CROPS } from "@/lib/sowing/crops";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { LocationSelect, type LocationOption } from "./LocationSelect";
import { Collapsible, Notice, Spinner } from "./ui";
import { ClimateCharts } from "./ClimateCharts";

type NowResponse = SowNowResult & { summary: ClimateSummary; normals: ClimateNormals; forecast: Forecast | null; location: { id: string; elevationM: number | null; label: string } };
type CalResponse = { calendar: FullCalendar };
const NAMES = new Map(CROPS.map((c) => [c.slug, c.names]));

export function SowView({ locations }: { locations: LocationOption[] }) {
  const { t, locale } = useI18n();
  const lang = locale === "en" ? "en" : "es";
  const s = t.sow;
  const [locationId, setLocationId] = useState<string | null>(locations[0]?.id ?? null);
  const [month, setMonth] = useState<number | null>(null);
  const [now, setNow] = useState<NowResponse | null>(null);
  const [cal, setCal] = useState<FullCalendar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 8;
  const name = (slug: string) => NAMES.get(slug)?.[lang] ?? slug;

  useEffect(() => {
    if (!locationId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const q = new URLSearchParams({ locationId, ...(month ? { month: String(month) } : {}) });
    Promise.all([api<NowResponse>(`/api/sowing/now?${q}`), api<CalResponse>(`/api/sowing/calendar?locationId=${locationId}`)])
      .then(([n, c]) => {
        if (cancelled) return;
        setNow(n);
        setCal(c.calendar);
        if (!month) setMonth(n.month);
      })
      .catch((e) => !cancelled && setError(e instanceof ApiError ? (e.code === "NETWORK" ? t.errors.network : e.message) : t.common.error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [locationId, month, t]);

  if (!locations.length) return <LocationSelect locations={[]} value={null} onChange={() => undefined} />;

  const actionLabel = { direct: s.direct, transplant: s.transplant, seedbed: s.seedbed, plant: s.plant };
  const sum = now?.summary;

  return (
    <div className="space-y-6">
      <div className="card grid gap-4 p-5 sm:grid-cols-[1fr_auto]">
        <LocationSelect locations={locations} value={locationId} onChange={(v) => { setLocationId(v); setMonth(null); }} />
        <div>
          <span className="label" id="month-label">{s.month}</span>
          <div className="flex max-w-full gap-1 overflow-x-auto pb-1" role="radiogroup" aria-labelledby="month-label">
            {t.common.months.map((m, i) => (
              <button key={m} type="button" role="radio" aria-checked={month === i + 1} onClick={() => { setMonth(i + 1); setShowAll(false); }}
                className={`min-h-11 min-w-11 rounded-xl px-2 text-sm font-semibold ${month === i + 1 ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "bg-[var(--surface-2)]"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <Notice tone="danger">{error}</Notice>}
      {loading && !now && <div className="card p-8"><Spinner label={t.common.loading} /></div>}

      {now && sum && (
        <div className={`space-y-6 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
          {now.normals.isTestFixture && <Notice tone="test">{t.common.testData}</Notice>}
          {now.warnings.map((w) => <Notice key={w} tone="warn"><AlertTriangle className="mr-1 inline h-4 w-4" aria-hidden />{w}</Notice>)}

          <section>
            <h2 className="section-title mb-3">{t.common.monthsLong[now.month - 1].replace(/^./, (c) => c.toUpperCase())} · {now.items.length}</h2>
            {now.items.length === 0 && <Notice>{s.noItems}</Notice>}
            <ul className="grid gap-3 md:grid-cols-2">
              {(showAll ? now.items : now.items.slice(0, VISIBLE)).map((it) => (
                <li key={it.slug + it.action} className="card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold">{it.name}</p>
                      <p className="muted text-sm italic">{it.scientificName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`chip ${it.quality === "optimal" ? "chip-green" : "chip-amber"}`}>{it.quality === "optimal" ? s.optimal : s.possible}</span>
                      <span className="chip">{actionLabel[it.action]}</span>
                    </div>
                  </div>
                  {it.caution && <p className="mt-2 text-sm font-semibold text-[var(--color-berry-600)]">⚠ {it.caution}</p>}
                  <p className="mt-2 text-sm">{it.why}</p>
                  {it.harvest && <p className="mt-1 text-sm"><span className="font-semibold">{s.harvest}:</span> {it.harvest.replace(/^[^:]+: /, "")}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                    <span className="chip"><Sun className="h-3 w-3" aria-hidden />{s.sun[it.conditions.sun as "full_sun" | "part_shade"]}</span>
                    <span className="chip"><Droplets className="h-3 w-3" aria-hidden />{s.water[it.conditions.water as "low" | "medium" | "high"]}</span>
                    {it.conditions.spacing && <span className="chip">↔ {it.conditions.spacing}</span>}
                  </div>
                  <p className="muted mt-1 text-xs">{it.conditions.soil}</p>
                </li>
              ))}
            </ul>
            {now.items.length > VISIBLE && (
              <button type="button" className="btn btn-ghost mt-3 w-full" aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
                {showAll ? (lang === "es" ? "Mostrar menos" : "Show less") : `${t.common.seeMore} (${now.items.length - VISIBLE})`}
              </button>
            )}
            {now.alternatives.length > 0 && (
              <div className="card mt-3 p-4"><p className="mb-1 font-semibold">{s.alternatives}</p><ul className="space-y-1 text-sm">{now.alternatives.map((a) => <li key={a}>• {a}</li>)}</ul></div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="section-title mb-3 flex items-center gap-2"><Thermometer className="h-5 w-5" aria-hidden /> {s.climate}</h2>
            <dl className="mb-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              <div className="rounded-xl bg-[var(--surface-2)] p-3"><dt className="muted text-xs">{s.koppen}</dt><dd className="font-semibold">{sum.koppen} · {KOPPEN_LABELS[sum.koppen]?.[lang] ?? ""}</dd></div>
              <div className="rounded-xl bg-[var(--surface-2)] p-3"><dt className="muted text-xs">{s.annualMean}</dt><dd className="font-semibold">{sum.annualMeanC} °C</dd></div>
              <div className="rounded-xl bg-[var(--surface-2)] p-3"><dt className="muted text-xs">{s.annualRain}</dt><dd className="font-semibold">{sum.annualPrecipMm} mm</dd></div>
              <div className="rounded-xl bg-[var(--surface-2)] p-3"><dt className="muted text-xs">{s.usda}</dt><dd className="font-semibold" title={sum.usdaZoneNote}>{sum.usdaZone ?? "—"}</dd></div>
              <div className="rounded-xl bg-[var(--surface-2)] p-3"><dt className="muted text-xs">{s.frost}</dt><dd className="font-semibold">{sum.frostRiskMonths.length ? sum.frostRiskMonths.map((m) => t.common.months[m - 1]).join(", ") : "—"}</dd></div>
              <div className="rounded-xl bg-[var(--surface-2)] p-3"><dt className="muted text-xs">{s.dry}</dt><dd className="font-semibold">{sum.dryMonths.length ? sum.dryMonths.map((m) => t.common.months[m - 1]).join(", ") : "—"}</dd></div>
              {now.normals.elevationM != null && <div className="rounded-xl bg-[var(--surface-2)] p-3"><dt className="muted text-xs flex items-center gap-1"><Mountain className="h-3 w-3" aria-hidden />{s.elevation}</dt><dd className="font-semibold">{Math.round(now.normals.elevationM)} m</dd></div>}
            </dl>
            <ClimateCharts months={now.normals.months} frostMonths={sum.frostRiskMonths} />
            {now.forecast && now.forecast.daily.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 font-semibold">{s.forecast}</h3>
                <ul className="flex gap-2 overflow-x-auto pb-1">
                  {now.forecast.daily.map((d) => (
                    <li key={d.date} className="min-w-20 rounded-xl bg-[var(--surface-2)] p-2 text-center text-sm">
                      <p className="muted text-xs">{new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric" }).format(new Date(d.date + "T12:00:00"))}</p>
                      <p className="font-semibold tabular-nums">{Math.round(d.tMax)}° / {Math.round(d.tMin)}°</p>
                      <p className="muted text-xs">{d.precipMm} mm</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}

      {cal && now && (
        <>
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="section-title flex items-center gap-2"><CalendarDays className="h-5 w-5" aria-hidden /> {s.calendar}</h2>
              <div className="flex gap-2">
                <a className="btn btn-ghost !py-2 text-sm" href={`/api/export/calendar?locationId=${locationId}&format=csv`}><Download className="h-4 w-4" aria-hidden /> {s.exportCsv}</a>
                <a className="btn btn-ghost !py-2 text-sm" href={`/api/export/calendar?locationId=${locationId}&format=ics`}><CalendarDays className="h-4 w-4" aria-hidden /> {s.exportIcs}</a>
              </div>
            </div>
            <div className="space-y-2">
              {cal.months.map((m) => {
                const groups = (["directSow", "seedbed", "transplant", "harvest", "flowers", "treesShrubs", "lawn"] as const).map((k) => [k, m[k].map(name)] as const);
                const tasks = (["prune", "fertilize", "maintenance", "protect", "postpone"] as const).map((k) => [k, m[k]] as const);
                return (
                  <Collapsible key={m.month} title={t.common.monthsLong[m.month - 1].replace(/^./, (c) => c.toUpperCase())} defaultOpen={m.month === now.month}>
                    <dl className="grid gap-3 md:grid-cols-2">
                      {[...groups, ...tasks].filter(([, v]) => v.length).map(([k, v]) => (
                        <div key={k}>
                          <dt className={`text-sm font-semibold ${k === "postpone" ? "text-[var(--color-berry-600)]" : k === "protect" ? "text-[var(--color-clay-500)]" : ""}`}>{s.tasks[k]}</dt>
                          <dd className="text-sm">{v.join(k === "prune" || k === "fertilize" || k === "maintenance" || k === "protect" || k === "postpone" ? " · " : ", ")}</dd>
                        </div>
                      ))}
                    </dl>
                  </Collapsible>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="section-title mb-3 flex items-center gap-2"><TreeDeciduous className="h-5 w-5" aria-hidden /> {s.fruit}</h2>
            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[...cal.perennials].sort((a, b) => ["suitable", "marginal", "unsuitable"].indexOf(a.verdict) - ["suitable", "marginal", "unsuitable"].indexOf(b.verdict)).map((p) => (
                <li key={p.slug} className={`card p-4 ${p.verdict === "unsuitable" ? "opacity-70" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{name(p.slug)}</p>
                    <span className={`chip ${p.verdict === "suitable" ? "chip-green" : p.verdict === "marginal" ? "chip-amber" : "chip-red"}`}>{s[p.verdict]}</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm">{p.reasons.map((r) => <li key={r}>• {r}</li>)}</ul>
                  {p.plantingMonths.length > 0 && <p className="mt-2 text-sm"><span className="font-semibold">{s.plant}:</span> {p.plantingMonths.map((mm) => t.common.months[mm - 1]).join(", ")}</p>}
                </li>
              ))}
            </ul>
          </section>

          <Collapsible title={s.sources}>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">{lang === "es" ? "Clima" : "Climate"}:</span> {now.normals.attribution} · {now.normals.periodStart} → {now.normals.periodEnd} · {lang === "es" ? "consultado" : "retrieved"} {now.normals.retrievedAt.slice(0, 10)}{now.normals.sourceUrl && <> · <a className="underline" href={now.normals.sourceUrl} target="_blank" rel="noopener noreferrer">{lang === "es" ? "documentación" : "docs"}</a></>}</p>
              <p className="muted">{now.normals.limitations}</p>
              <p><span className="font-semibold">{lang === "es" ? "Cultivos" : "Crops"}:</span> {lang === "es" ? "parámetros agronómicos generales por especie (temperaturas de germinación de Knott's Handbook for Vegetable Growers, rangos de extensión agraria y requerimientos de frío habituales). Las variedades pueden diferir mucho: consulta el sobre de semillas y a tu vivero o servicio de extensión local." : "general per-species agronomic parameters (germination temperatures from Knott's Handbook for Vegetable Growers, extension-service ranges and typical chill requirements). Varieties can differ greatly: check the seed packet and your local nursery or extension service."}</p>
              <p className="muted">{sum?.usdaZoneNote}</p>
              <p className="muted">{lang === "es" ? "La temperatura media del aire se usa como aproximación de la del suelo; el efecto del invernadero es una estimación (+4 °C de media)." : "Mean air temperature approximates soil temperature; the greenhouse effect is an estimate (+4 °C mean)."}</p>
            </div>
          </Collapsible>
        </>
      )}
      <span className="sr-only"><Sprout aria-hidden /></span>
    </div>
  );
}

import { AlertTriangle, ShieldAlert, ListChecks, Stethoscope, FlaskConical } from "lucide-react";
import type { Diagnosis } from "@/lib/domain/diagnosis";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Collapsible, ConfidenceMeter, List, Notice } from "./ui";

const SEV_CHIP = { mild: "chip-green", moderate: "chip-amber", severe: "chip-clay", urgent: "chip-red" } as const;

export function DiagnosisView({ data, t }: { data: Diagnosis; t: Dictionary }) {
  const d = t.diagnose;
  return (
    <div className="space-y-4">
      <Notice tone="warn"><ShieldAlert className="mr-1 inline h-4 w-4" aria-hidden /> {d.disclaimer}</Notice>
      <section className="card overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <p className="muted text-sm">{d.probable}{data.plant_guess ? ` · ${data.plant_guess}` : ""}</p>
          <h2 className="mt-1 text-3xl font-semibold">{data.primary.problem}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={`chip ${SEV_CHIP[data.primary.severity]}`}>{d.severity}: {d.sev[data.primary.severity]}</span>
            <ConfidenceMeter score={data.primary.confidence_score} level={data.primary.confidence_level} label={t.identify.confidence} />
          </div>
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div><h3 className="mb-2 font-semibold">{d.supporting}</h3><List items={data.primary.supporting_symptoms} /></div>
          <div><h3 className="mb-2 flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-[var(--color-clay-500)]" aria-hidden /> {d.immediate}</h3><List items={data.immediate_actions} /></div>
        </div>
      </section>

      {data.alternatives.length > 0 && (
        <section className="card p-5">
          <h3 className="section-title mb-3">{d.alternatives}</h3>
          <ul className="grid gap-3 md:grid-cols-2">
            {data.alternatives.map((a, i) => (
              <li key={i} className="rounded-2xl border border-[var(--line)] p-4">
                <p className="font-semibold">{a.problem} <span className="chip ml-1">{a.confidence_level}</span></p>
                <p className="mt-1 text-sm">{a.why_possible}</p>
                <p className="muted mt-1 text-sm">↳ {a.how_to_distinguish}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Collapsible title={d.questions} defaultOpen><List items={data.differentiating_questions} /></Collapsible>
        <Collapsible title={d.verify} defaultOpen><List items={data.how_to_verify} /></Collapsible>
        <Collapsible title={d.plan} defaultOpen badge={<ListChecks className="h-4 w-4" aria-hidden />}>
          <ol className="space-y-3">
            {data.recovery_plan.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage-100)] text-sm font-bold text-[var(--color-forest-800)]">{i + 1}</span>
                <div><p className="font-semibold">{s.step}{s.timeframe && <span className="muted font-normal"> · {s.timeframe}</span>}</p><p className="text-sm">{s.detail}</p></div>
              </li>
            ))}
          </ol>
          {data.recovery_time && <p className="mt-3 text-sm"><span className="font-semibold">{d.recoveryTime}:</span> {data.recovery_time}</p>}
        </Collapsible>
        <Collapsible title={d.prevention}><List items={data.prevention} /></Collapsible>
        <Collapsible title={`${d.improving} / ${d.failing}`}>
          <p className="text-sm font-semibold text-[var(--color-forest-600)]">{d.improving}</p>
          <List items={data.improvement_signs} />
          <p className="mt-3 text-sm font-semibold text-[var(--color-berry-600)]">{d.failing}</p>
          <List items={data.failure_signs} />
        </Collapsible>
        <Collapsible title={`${d.isolate} · ${d.professional}`} badge={<Stethoscope className="h-4 w-4" aria-hidden />}>
          <p><span className="font-semibold">{d.isolate}:</span> {data.isolate_or_remove}</p>
          <p className="mt-2"><span className="font-semibold">{d.professional}:</span> {data.when_to_call_professional}</p>
        </Collapsible>
      </div>

      {data.chemical_options.length > 0 && (
        <Collapsible title={d.chemical} badge={<FlaskConical className="h-4 w-4" aria-hidden />}>
          <Notice tone="warn">{d.chemicalNote}</Notice>
          <ul className="mt-3 space-y-3">
            {data.chemical_options.map((c, i) => (
              <li key={i} className="rounded-2xl border border-[var(--line)] p-4 text-sm">
                <p className="font-semibold">{c.active_ingredient_or_type}</p>
                <p>{c.purpose}</p>
                <p className="muted mt-1">{c.limitations}</p>
                <p className="mt-1 text-[var(--color-clay-500)]">{c.precautions}</p>
              </li>
            ))}
          </ul>
        </Collapsible>
      )}
    </div>
  );
}

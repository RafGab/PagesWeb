import { CheckCircle2, AlertTriangle, Camera, HelpCircle, Skull, Droplets, Sun, Layers, Scissors, Sprout, Info } from "lucide-react";
import type { Identification } from "@/lib/domain/identification";
import type { NameVerification } from "@/lib/taxonomy/gbif";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Collapsible, ConfidenceMeter, Field, List, Notice } from "./ui";

const LEVEL_CHIP = { high: "chip-green", medium: "chip-amber", low: "chip-clay" } as const;
const TOX_CHIP = { toxic: "chip-red", mildly_toxic: "chip-amber", non_toxic: "chip-green", unknown: "" } as const;

export function IdentificationView({ data, verification, t, locale }: { data: Identification; verification: NameVerification[]; t: Dictionary; locale: string }) {
  const es = locale === "es";
  const top = data.candidates[0];
  const p = data.profile;
  const u = t.common.unknown;
  const levelLabel = (l: "high" | "medium" | "low") => (es ? { high: "Alta", medium: "Media", low: "Baja" } : { high: "High", medium: "Medium", low: "Low" })[l];
  const toxLabel = (s: keyof typeof TOX_CHIP) => (es ? { toxic: "Tóxica", mildly_toxic: "Ligeramente tóxica", non_toxic: "No tóxica", unknown: "Sin datos fiables" } : { toxic: "Toxic", mildly_toxic: "Mildly toxic", non_toxic: "Non-toxic", unknown: "No reliable data" })[s];
  const v0 = verification[0];

  if (!data.is_plant) return <Notice tone="warn">{data.subject_summary}</Notice>;

  return (
    <div className="space-y-4">
      {top && (
        <section className="card overflow-hidden">
          <div className="bg-gradient-to-br from-[var(--color-forest-800)] to-[var(--color-forest-600)] p-6 text-white">
            <p className="text-sm uppercase tracking-widest opacity-80">{top.family ?? ""}</p>
            <h2 className="mt-1 text-3xl font-semibold sm:text-4xl">{top.common_names[0]?.name ?? top.scientific_name}</h2>
            <p className="mt-1 text-xl italic opacity-95">
              {top.scientific_name} {top.authorship && <span className="not-italic text-base opacity-75">{top.authorship}</span>}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={`chip ${LEVEL_CHIP[top.confidence_level]}`}>{t.identify.confidence}: {levelLabel(top.confidence_level)}</span>
              {v0 && (
                <span className="chip bg-white/15 text-white border-white/30">
                  {v0.status === "accepted" ? <><CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t.identify.verified}</> : v0.status === "synonym" ? `${t.identify.synonym} → ${v0.acceptedName}` : v0.status === "unavailable" ? t.identify.unavailableVerification : t.identify.notVerified}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2 p-5">
            <p>{data.subject_summary}</p>
            {top.common_names.length > 1 && (
              <p className="muted text-sm">{top.common_names.slice(1).map((c) => `${c.name}${c.region ? ` (${c.region})` : ""}`).join(" · ")}</p>
            )}
            {v0?.referenceUrl && (
              <p className="text-sm"><a className="underline" href={v0.referenceUrl} target="_blank" rel="noopener noreferrer">GBIF</a> <span className="muted">· {v0.retrievedAt.slice(0, 10)}</span></p>
            )}
          </div>
        </section>
      )}

      <section className="card p-5">
        <h3 className="section-title">{t.identify.candidates}</h3>
        <p className="muted mb-3 flex items-center gap-1 text-xs"><Info className="h-3.5 w-3.5" aria-hidden /> {t.identify.confidenceNote}</p>
        <ol className="space-y-3">
          {data.candidates.map((c, i) => (
            <li key={c.scientific_name + i} className="rounded-2xl border border-[var(--line)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold"><span className="muted mr-1">{i + 1}.</span><span className="italic">{c.scientific_name}</span> {c.common_names[0] && <span className="font-normal muted">— {c.common_names[0].name}</span>}</p>
                <ConfidenceMeter score={c.confidence_score} level={c.confidence_level} label={t.identify.confidence} />
              </div>
              {c.visual_evidence.length > 0 && <p className="mt-2 text-sm"><span className="font-semibold">{t.identify.evidence}:</span> {c.visual_evidence.join("; ")}</p>}
              {c.distinguishing_features && <p className="muted mt-1 text-sm">{c.distinguishing_features}</p>}
              {verification[i] && verification[i].status !== "accepted" && verification[i].status !== "unavailable" && (
                <p className="mt-1 text-xs text-[var(--color-clay-500)]">GBIF: {verification[i].status}{verification[i].acceptedName ? ` → ${verification[i].acceptedName}` : ""}</p>
              )}
            </li>
          ))}
        </ol>
      </section>

      {(data.similar_species_differences.length > 0 || data.additional_photos_needed.length > 0 || data.follow_up_questions.length > 0) && (
        <div className="grid gap-4 md:grid-cols-3">
          {data.similar_species_differences.length > 0 && <div className="card p-5"><h3 className="mb-2 flex items-center gap-2 font-semibold"><Layers className="h-4 w-4" aria-hidden /> {t.identify.differences}</h3><List items={data.similar_species_differences} /></div>}
          {data.additional_photos_needed.length > 0 && <div className="card p-5"><h3 className="mb-2 flex items-center gap-2 font-semibold"><Camera className="h-4 w-4" aria-hidden /> {t.identify.morePhotos}</h3><List items={data.additional_photos_needed} /></div>}
          {data.follow_up_questions.length > 0 && <div className="card p-5"><h3 className="mb-2 flex items-center gap-2 font-semibold"><HelpCircle className="h-4 w-4" aria-hidden /> {t.identify.questions}</h3><List items={data.follow_up_questions} /></div>}
        </div>
      )}

      {p && (
        <>
          <section className="card p-5">
            <h3 className="section-title mb-3">{t.identify.profile}</h3>
            <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <Field label={es ? "Tipo" : "Type"} value={p.plant_type} unknown={u} />
              <Field label={es ? "Ciclo" : "Life cycle"} value={p.life_cycle === "unknown" ? null : (es ? { annual: "Anual", biennial: "Bienal", perennial: "Perenne", variable: "Variable" } : { annual: "Annual", biennial: "Biennial", perennial: "Perennial", variable: "Variable" })[p.life_cycle]} unknown={u} />
              <Field label={es ? "Altura adulta" : "Mature height"} value={p.adult_height} unknown={u} />
              <Field label={es ? "Anchura adulta" : "Mature width"} value={p.adult_width} unknown={u} />
              <Field label={es ? "Crecimiento" : "Growth rate"} value={p.growth_rate} unknown={u} />
              <Field label={es ? "Origen" : "Origin"} value={p.native_origin} unknown={u} />
              <Field label={es ? "Floración" : "Flowering"} value={p.flowering_season} unknown={u} />
              <Field label={es ? "Dificultad" : "Difficulty"} value={(es ? { easy: "Fácil", moderate: "Media", hard: "Difícil", expert: "Experta" } : { easy: "Easy", moderate: "Moderate", hard: "Hard", expert: "Expert" })[p.care.other.difficulty]} unknown={u} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1 text-sm font-semibold"><Skull className="h-4 w-4" aria-hidden /> {es ? "Toxicidad" : "Toxicity"}:</span>
              {(["humans", "dogs", "cats", "other_animals"] as const).map((k) => (
                <span key={k} className={`chip ${TOX_CHIP[p.toxicity[k].status]}`} title={p.toxicity[k].notes ?? undefined}>
                  {(es ? { humans: "Personas", dogs: "Perros", cats: "Gatos", other_animals: "Otros animales" } : { humans: "People", dogs: "Dogs", cats: "Cats", other_animals: "Other animals" })[k]}: {toxLabel(p.toxicity[k].status)}
                </span>
              ))}
            </div>
            {p.invasiveness && <div className="mt-3"><Notice tone="warn"><AlertTriangle className="mr-1 inline h-4 w-4" aria-hidden />{p.invasiveness}</Notice></div>}
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <Collapsible title={es ? "Riego" : "Watering"} defaultOpen badge={<Droplets className="h-4 w-4 text-[#4f8fb0]" aria-hidden />}>
              <p>{p.care.watering.frequency_guidance}</p>
              <dl className="mt-3 grid gap-2">
                <Field label={es ? "Cantidad" : "Amount"} value={p.care.watering.amount_guidance} unknown={u} />
                <Field label={es ? "Método" : "Method"} value={p.care.watering.method} unknown={u} />
                <Field label={es ? "Cómo comprobar" : "How to check"} value={p.care.watering.how_to_check} unknown={u} />
                <Field label={es ? "Según la estación" : "Seasonal"} value={p.care.watering.seasonal_adjustments} unknown={u} />
                <Field label={es ? "Drenaje" : "Drainage"} value={p.care.watering.drainage} unknown={u} />
              </dl>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div><p className="text-sm font-semibold">{es ? "Falta de agua" : "Underwatering"}</p><List items={p.care.watering.underwatering_signs} /></div>
                <div><p className="text-sm font-semibold">{es ? "Exceso de agua" : "Overwatering"}</p><List items={p.care.watering.overwatering_signs} /></div>
              </div>
            </Collapsible>
            <Collapsible title={es ? "Luz y temperatura" : "Light & temperature"} defaultOpen badge={<Sun className="h-4 w-4 text-[var(--color-sun-500)]" aria-hidden />}>
              <dl className="grid gap-2">
                <Field label={es ? "Exposición" : "Exposure"} value={(es ? { full_sun: "Pleno sol", part_shade: "Semisombra", shade: "Sombra", bright_indirect: "Luz indirecta brillante", varies: "Variable" } : { full_sun: "Full sun", part_shade: "Part shade", shade: "Shade", bright_indirect: "Bright indirect", varies: "Varies" })[p.care.light_temperature.exposure]} unknown={u} />
                <Field label={es ? "Horas de luz" : "Light hours"} value={p.care.light_temperature.light_hours} unknown={u} />
                <Field label={es ? "Temperatura óptima" : "Optimal temperature"} value={p.care.light_temperature.optimal_temperature} unknown={u} />
                <Field label={es ? "Mínima aproximada" : "Approx. minimum"} value={p.care.light_temperature.min_temperature_c != null ? `${p.care.light_temperature.min_temperature_c} °C` : null} unknown={u} />
                <Field label={es ? "Heladas" : "Frost"} value={p.care.light_temperature.frost_risk} unknown={u} />
                <Field label={es ? "Protección estacional" : "Seasonal protection"} value={p.care.light_temperature.seasonal_protection} unknown={u} />
              </dl>
            </Collapsible>
            <Collapsible title={es ? "Suelo y nutrición" : "Soil & nutrition"} badge={<Layers className="h-4 w-4 text-[var(--color-bark-600)]" aria-hidden />}>
              <dl className="grid gap-2">
                <Field label={es ? "Sustrato" : "Soil"} value={p.care.soil_nutrition.soil_type} unknown={u} />
                <Field label="pH" value={p.care.soil_nutrition.ph} unknown={u} />
                <Field label={es ? "Drenaje y aireación" : "Drainage & aeration"} value={p.care.soil_nutrition.drainage_aeration} unknown={u} />
                <Field label={es ? "Materia orgánica" : "Organic matter"} value={p.care.soil_nutrition.organic_matter} unknown={u} />
                <Field label={es ? "Nutrientes clave" : "Key nutrients"} value={p.care.soil_nutrition.key_nutrients} unknown={u} />
                <Field label={es ? "Abonado" : "Feeding"} value={p.care.soil_nutrition.fertilizing} unknown={u} />
                <Field label={es ? "Maceta / suelo" : "Pot / ground"} value={p.care.soil_nutrition.container_suitability} unknown={u} />
              </dl>
              {p.care.soil_nutrition.deficiency_signs.length > 0 && <div className="mt-3"><p className="text-sm font-semibold">{es ? "Signos de carencia" : "Deficiency signs"}</p><List items={p.care.soil_nutrition.deficiency_signs} /></div>}
            </Collapsible>
            <Collapsible title={es ? "Poda y mantenimiento" : "Pruning & maintenance"} badge={<Scissors className="h-4 w-4" aria-hidden />}>
              <dl className="grid gap-2">
                <Field label={es ? "Cuándo" : "When"} value={p.care.pruning_maintenance.when} unknown={u} />
                <Field label={es ? "Qué eliminar" : "What to remove"} value={p.care.pruning_maintenance.what} unknown={u} />
                <Field label={es ? "Herramientas" : "Tools"} value={p.care.pruning_maintenance.tools} unknown={u} />
                <Field label={es ? "Formación" : "Shaping"} value={p.care.pruning_maintenance.shaping} unknown={u} />
                <Field label={es ? "Floración / fructificación" : "Flowering / fruiting"} value={p.care.pruning_maintenance.flowering_fruiting} unknown={u} />
                <Field label={es ? "Trasplante" : "Repotting"} value={p.care.pruning_maintenance.repotting_frequency} unknown={u} />
              </dl>
            </Collapsible>
            <Collapsible title={es ? "Reproducción" : "Propagation"} badge={<Sprout className="h-4 w-4 text-[var(--color-forest-600)]" aria-hidden />}>
              {p.care.propagation.methods.length ? (
                <ul className="space-y-2">
                  {p.care.propagation.methods.map((m, i) => (
                    <li key={i} className="rounded-xl bg-[var(--surface-2)] p-3"><p className="font-semibold capitalize">{m.method}</p><p className="text-sm">{m.how}</p>{m.rooting_or_germination_time && <p className="muted text-xs">{m.rooting_or_germination_time}</p>}</li>
                  ))}
                </ul>
              ) : <p className="muted">{u}</p>}
              {p.care.propagation.young_plant_care && <p className="mt-2 text-sm">{p.care.propagation.young_plant_care}</p>}
            </Collapsible>
            <Collapsible title={es ? "Descripción botánica" : "Botanical description"}>
              <dl className="grid gap-2">
                <Field label={es ? "Taxonomía" : "Taxonomy"} value={[p.taxonomy.kingdom, p.taxonomy.order, p.taxonomy.family, p.taxonomy.genus, p.taxonomy.species && `${p.taxonomy.genus} ${p.taxonomy.species}`, p.taxonomy.infraspecific, p.taxonomy.cultivar && `'${p.taxonomy.cultivar}'`].filter(Boolean).join(" › ")} unknown={u} />
                <Field label={es ? "Distribución natural" : "Native range"} value={p.native_distribution} unknown={u} />
                <Field label={es ? "Hábitat" : "Habitat"} value={p.habitat} unknown={u} />
                <Field label={es ? "Porte" : "Habit"} value={p.growth_habit} unknown={u} />
                <Field label={es ? "Hojas" : "Leaves"} value={p.leaves} unknown={u} />
                <Field label={es ? "Tallo" : "Stem"} value={p.stem} unknown={u} />
                <Field label={es ? "Flores" : "Flowers"} value={p.flowers} unknown={u} />
                <Field label={es ? "Frutos y semillas" : "Fruit & seeds"} value={p.fruits_seeds} unknown={u} />
                <Field label={es ? "Longevidad" : "Lifespan"} value={p.lifespan} unknown={u} />
                <Field label={es ? "Usos" : "Uses"} value={p.uses.join(", ")} unknown={u} />
              </dl>
            </Collapsible>
            <Collapsible title={es ? "Problemas y consejos" : "Problems & tips"}>
              <p className="text-sm font-semibold">{es ? "Problemas frecuentes" : "Common problems"}</p>
              <List items={p.main_problems} />
              <p className="mt-3 text-sm font-semibold">{es ? "Mantenimiento" : "Maintenance"}</p>
              <List items={p.maintenance_tips} />
              {p.care.other.companions.length > 0 && <><p className="mt-3 text-sm font-semibold">{es ? "Compatibles" : "Companions"}</p><List items={p.care.other.companions} /></>}
              {p.care.other.safety_precautions.length > 0 && <><p className="mt-3 text-sm font-semibold">{es ? "Precauciones" : "Precautions"}</p><List items={p.care.other.safety_precautions} /></>}
            </Collapsible>
          </div>
        </>
      )}
    </div>
  );
}

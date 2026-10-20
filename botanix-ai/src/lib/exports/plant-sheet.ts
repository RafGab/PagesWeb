import type { Identification } from "@/lib/domain/identification";
import type { NameVerification } from "@/lib/taxonomy/gbif";

const v = (x: string | null | undefined) => (x && x.trim() ? x : "—");

/** Ficha en Markdown para exportar o imprimir. */
export function plantSheetMarkdown(id: Identification, verification: NameVerification[], warnings: string[], date: Date, isTestFixture: boolean): string {
  const top = id.candidates[0];
  const p = id.profile;
  const out: string[] = [];
  if (isTestFixture) out.push("> **DATOS DE PRUEBA** — no es un análisis real.\n");
  out.push(`# ${top?.common_names[0]?.name ?? top?.scientific_name ?? "Planta"} — *${top?.scientific_name ?? "sin identificar"}*${top?.authorship ? ` ${top.authorship}` : ""}`);
  out.push(`\nFicha generada por Botanix AI el ${date.toISOString().slice(0, 10)}. Identificación visual con IA: verifica los datos críticos (toxicidad, comestibilidad) con una fuente experta.\n`);
  if (warnings.length) out.push("## Avisos\n" + warnings.map((w) => `- ${w}`).join("\n") + "\n");
  out.push("## Candidatos\n| Especie | Familia | Confianza estimada |\n|---|---|---|");
  for (const c of id.candidates) out.push(`| *${c.scientific_name}* | ${v(c.family)} | ${c.confidence_level} (${c.confidence_score}/100) |`);
  const ver = verification[0];
  if (ver) out.push(`\nVerificación taxonómica (GBIF): ${ver.status}${ver.acceptedName ? ` — nombre aceptado: *${ver.acceptedName}*` : ""}${ver.referenceUrl ? ` — ${ver.referenceUrl}` : ""} (consultado ${ver.retrievedAt.slice(0, 10)})`);
  if (p) {
    out.push("\n## Taxonomía");
    out.push(`Reino: ${v(p.taxonomy.kingdom)} · Orden: ${v(p.taxonomy.order)} · Familia: ${v(p.taxonomy.family)} · Género: ${v(p.taxonomy.genus)} · Especie: ${v(p.taxonomy.species)}`);
    out.push("\n## Descripción");
    const rows: [string, string | null][] = [
      ["Origen", p.native_origin], ["Distribución natural", p.native_distribution], ["Hábitat", p.habitat], ["Tipo", p.plant_type], ["Ciclo", p.life_cycle],
      ["Altura adulta", p.adult_height], ["Anchura adulta", p.adult_width], ["Crecimiento", p.growth_rate], ["Porte", p.growth_habit], ["Hojas", p.leaves],
      ["Tallo", p.stem], ["Flores", p.flowers], ["Floración", p.flowering_season], ["Frutos y semillas", p.fruits_seeds], ["Longevidad", p.lifespan], ["Invasividad", p.invasiveness],
    ];
    for (const [k, val] of rows) out.push(`- **${k}:** ${v(val)}`);
    out.push(`- **Usos:** ${p.uses.length ? p.uses.join(", ") : "—"}`);
    out.push("\n## Toxicidad");
    for (const [k, t] of Object.entries(p.toxicity)) out.push(`- **${k}:** ${t.status}${t.notes ? ` — ${t.notes}` : ""}`);
    const c = p.care;
    out.push("\n## Cuidados");
    out.push(`- **Riego:** ${c.watering.frequency_guidance}. Comprobar: ${c.watering.how_to_check}`);
    out.push(`- **Luz:** ${c.light_temperature.exposure}; temperatura óptima ${v(c.light_temperature.optimal_temperature)}; mínima ${c.light_temperature.min_temperature_c ?? "—"} °C`);
    out.push(`- **Suelo:** ${v(c.soil_nutrition.soil_type)}; pH ${v(c.soil_nutrition.ph)}; abonado ${v(c.soil_nutrition.fertilizing)}`);
    out.push(`- **Poda:** ${v(c.pruning_maintenance.when)} — ${v(c.pruning_maintenance.what)}`);
    out.push(`- **Propagación:** ${c.propagation.methods.map((m) => `${m.method}: ${m.how}`).join("; ") || "—"}`);
    out.push(`- **Dificultad:** ${c.other.difficulty}`);
    if (p.main_problems.length) out.push("\n## Problemas frecuentes\n" + p.main_problems.map((x) => `- ${x}`).join("\n"));
  }
  return out.join("\n") + "\n";
}

import type { Identification } from "@/lib/domain/identification";
import type { Diagnosis } from "@/lib/domain/diagnosis";
import type { GardenDesign } from "@/lib/domain/garden-design";

// Controles deterministas aplicados a toda salida de IA antes de mostrarla o guardarla.
// No dependen del proveedor: protegen frente a exceso de confianza, dosis inventadas,
// afirmaciones de comestibilidad con identificaciones dudosas e incoherencias.

export interface Guarded<T> {
  data: T;
  warnings: string[];
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(x) ? x : lo));

// Cantidad + unidad típica de dosificación: "5 ml/l", "2 g por litro", "10 cc", "0,5 %", "3 ml por cada 10 L", "200 ppm".
const DOSE_RE = /(?<![\p{L}\d])\d+(?:[.,]\d+)?\s*(?:ml|cc|cm3|g|gr|gramos?|kg|l|litros?|%|ppm|oz|tbsp|tsp|cucharad(?:a|ita)s?)(?![\p{L}])(?:\s*(?:\/|por(?: cada)?|per|en)\s*(?:\d+(?:[.,]\d+)?\s*)?(?:l|litros?|liters?|m2|m²|ha|gal(?:lon)?s?|agua|water)(?![\p{L}]))?/giu;
const DOSE_REPLACEMENT = "[dosis según etiqueta oficial]";

export function stripDoses(text: string): { text: string; changed: boolean } {
  const out = text.replace(DOSE_RE, DOSE_REPLACEMENT);
  return { text: out, changed: out !== text };
}

const EDIBLE_RE = /comest|edible|culinar|cocina|cooking|medicin|infusi|ensalada|salad|\b(?:eat|eaten|tea|té)(?![\p{L}])/iu;

export function isUncertainIdentification(id: Identification): boolean {
  const [top, second] = id.candidates;
  if (!top) return true;
  if (top.confidence_level !== "high" || top.confidence_score < 70) return true;
  if (second && top.confidence_score - second.confidence_score < 15) return true;
  return false;
}

export function guardIdentification(input: Identification): Guarded<Identification> {
  const warnings: string[] = [];
  const id: Identification = structuredClone(input);

  id.candidates = id.candidates
    .map((c) => ({ ...c, confidence_score: Math.round(clamp(c.confidence_score, 0, 100)) }))
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, 5);

  // Coherencia nivel cualitativo / puntuación.
  for (const c of id.candidates) {
    if (c.confidence_level === "high" && c.confidence_score < 60) c.confidence_level = "medium";
    if (c.confidence_level !== "low" && c.confidence_score < 35) c.confidence_level = "low";
  }

  if (!id.is_plant) {
    id.candidates = [];
    id.profile = null;
    warnings.push("La foto no parece contener una planta.");
    return { data: id, warnings };
  }

  if (!id.image_quality.usable) {
    for (const c of id.candidates) if (c.confidence_level === "high") c.confidence_level = "medium";
    warnings.push("La calidad de la foto limita la identificación.");
  }

  // Coherencia taxonómica básica: el género debe coincidir con el primer término del nombre científico.
  for (const c of id.candidates) {
    const firstWord = c.scientific_name.trim().split(/\s+/)[0];
    if (c.genus && c.rank !== "family" && firstWord && firstWord.toLowerCase() !== c.genus.toLowerCase()) {
      warnings.push(`Posible incoherencia taxonómica: «${c.scientific_name}» no pertenece al género indicado (${c.genus}).`);
    }
  }
  const top = id.candidates[0];
  if (top && id.profile?.taxonomy.genus && top.genus && id.profile.taxonomy.genus.toLowerCase() !== top.genus.toLowerCase()) {
    warnings.push("La ficha no coincide con el candidato principal; revísala con cautela.");
  }

  const uncertain = isUncertainIdentification(id);
  if (uncertain) {
    warnings.push("Identificación incierta: compara los candidatos y aporta más fotos antes de tomar decisiones.");
    if (id.additional_photos_needed.length === 0) {
      id.additional_photos_needed = ["Hoja completa por el haz y el envés", "Flor o fruto si los hay", "Planta entera con referencia de tamaño", "Tallo y punto de inserción de las hojas"];
    }
    if (id.profile) {
      const before = id.profile.uses.length;
      id.profile.uses = id.profile.uses.filter((u) => !EDIBLE_RE.test(u));
      if (id.profile.uses.length !== before) warnings.push("Se han ocultado usos comestibles o medicinales porque la identificación no es segura.");
    }
    if (top && top.confidence_level === "low") id.profile = null;
  }

  if (id.profile) {
    const t = id.profile.toxicity;
    if ([t.humans, t.dogs, t.cats].some((x) => x.status === "toxic" || x.status === "mildly_toxic")) {
      warnings.push("Planta potencialmente tóxica: mantenla fuera del alcance de niños y mascotas.");
    }
    if (id.profile.invasiveness) warnings.push("Revisa la información de invasividad antes de plantarla en exterior.");
  }
  return { data: id, warnings };
}

export function guardDiagnosis(input: Diagnosis): Guarded<Diagnosis> {
  const warnings: string[] = [];
  const d: Diagnosis = structuredClone(input);
  d.diagnosis_type = "visual_orientative";
  d.primary.confidence_score = Math.round(clamp(d.primary.confidence_score, 0, 100));

  if (!d.image_quality.usable && d.primary.confidence_level === "high") {
    d.primary.confidence_level = "medium";
    warnings.push("Confianza reducida: la foto no permite un diagnóstico claro.");
  }
  if (d.primary.confidence_level === "high" && d.primary.confidence_score < 60) d.primary.confidence_level = "medium";
  // Un diagnóstico visual muy seguro sin alternativas es sospechoso de exceso de confianza.
  if (d.alternatives.length === 0) {
    if (d.primary.confidence_level === "high") d.primary.confidence_level = "medium";
    warnings.push("No se han propuesto causas alternativas: comprueba el diagnóstico con las preguntas sugeridas.");
  }
  if ((d.primary.severity === "severe" || d.primary.severity === "urgent") && !d.when_to_call_professional.trim()) {
    d.when_to_call_professional = "Por la gravedad, consulta con un técnico o laboratorio de sanidad vegetal si no mejora en pocos días.";
  }

  // Sin dosis en ningún texto.
  let dosesRemoved = false;
  const clean = (s: string) => {
    const r = stripDoses(s);
    if (r.changed) dosesRemoved = true;
    return r.text;
  };
  d.immediate_actions = d.immediate_actions.map(clean);
  d.recovery_plan = d.recovery_plan.map((s) => ({ ...s, step: clean(s.step), detail: clean(s.detail) }));
  d.prevention = d.prevention.map(clean);
  d.chemical_options = d.chemical_options.map((c) => ({
    active_ingredient_or_type: clean(c.active_ingredient_or_type),
    purpose: clean(c.purpose),
    limitations: clean(c.limitations),
    precautions: clean(c.precautions),
  }));
  if (dosesRemoved) warnings.push("Se han eliminado dosis de la respuesta: usa siempre las de la etiqueta oficial del producto autorizado.");
  if (d.chemical_options.length) {
    warnings.push("Antes de usar cualquier producto fitosanitario, comprueba que está autorizado para ese cultivo en tu país y sigue la etiqueta.");
  }
  return { data: d, warnings };
}

export function guardGardenDesign(input: GardenDesign): Guarded<GardenDesign> {
  const warnings: string[] = [];
  const g: GardenDesign = structuredClone(input);
  const W = g.plan_width_m && g.plan_width_m > 0 ? g.plan_width_m : null;
  const D = g.plan_depth_m && g.plan_depth_m > 0 ? g.plan_depth_m : null;

  for (const p of g.proposals) {
    const zoneIds = new Set(p.zones.map((z) => z.id));
    for (const z of p.zones) {
      z.width_m = Math.max(0.2, z.width_m);
      z.depth_m = Math.max(0.2, z.depth_m);
      z.x_m = Math.max(0, z.x_m);
      z.y_m = Math.max(0, z.y_m);
      if (W && z.x_m + z.width_m > W + 0.01) {
        z.width_m = Math.max(0.2, W - z.x_m);
        warnings.push(`Zona «${z.name}» ajustada al ancho del plano.`);
      }
      if (D && z.y_m + z.depth_m > D + 0.01) {
        z.depth_m = Math.max(0.2, D - z.y_m);
        warnings.push(`Zona «${z.name}» ajustada al fondo del plano.`);
      }
    }
    for (const pl of p.plants) {
      pl.quantity = Math.max(1, Math.round(pl.quantity));
      if (!zoneIds.has(pl.zone_id)) warnings.push(`«${pl.common_name}» está asignada a una zona inexistente (${pl.zone_id}).`);
      if (pl.invasive_warning) warnings.push(`Atención: ${pl.common_name} (${pl.scientific_name}) — ${pl.invasive_warning}`);
    }
    for (const line of p.cost_estimate.lines) {
      line.low = Math.max(0, line.low);
      line.high = Math.max(line.low, line.high);
    }
    const t = p.cost_estimate.tiers;
    if (!(t.economy.total_low <= t.balanced.total_low && t.balanced.total_low <= t.premium.total_low)) {
      warnings.push(`Los niveles de presupuesto de «${p.title}» no son coherentes; revísalos.`);
    }
  }
  if (!W || !D) warnings.push("Plano esquemático sin medidas reales: añade las dimensiones para un plano a escala.");
  warnings.push("Presupuesto orientativo: no son precios actuales de mercado ni confirman disponibilidad.");
  return { data: g, warnings: [...new Set(warnings)] };
}

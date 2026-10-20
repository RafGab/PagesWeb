import type { Identification } from "@/lib/domain/identification";
import type { Diagnosis } from "@/lib/domain/diagnosis";
import type { GardenDesign } from "@/lib/domain/garden-design";
import type { AiProvider, ChatRequest, ChatResult, StructuredRequest, StructuredResult } from "../types";

// ⚠️ PROVEEDOR DE DATOS DE PRUEBA. Solo se activa con AI_PROVIDER=fixture en pruebas
// automatizadas (NODE_ENV=test o BOTANIX_ALLOW_FIXTURES=1). Devuelve siempre las mismas
// respuestas, marcadas con isTestFixture=true; la interfaz muestra un aviso visible.

const care = {
  watering: {
    frequency_guidance: "[PRUEBA] Riega cuando los 2–3 cm superiores del sustrato estén secos.",
    amount_guidance: null,
    method: "Riego a fondo hasta que drene por los agujeros",
    how_to_check: "Introduce un dedo en el sustrato",
    underwatering_signs: ["Hojas lacias"],
    overwatering_signs: ["Hojas amarillas", "Sustrato siempre húmedo"],
    seasonal_adjustments: "Menos riego en invierno",
    drainage: "Imprescindible",
  },
  light_temperature: {
    exposure: "bright_indirect" as const,
    light_hours: null,
    optimal_temperature: "18–27 °C",
    heat_tolerance: null,
    cold_tolerance: null,
    min_temperature_c: 12,
    frost_risk: "No tolera heladas",
    seasonal_protection: null,
  },
  soil_nutrition: {
    soil_type: "Sustrato aireado con corteza",
    ph: null,
    drainage_aeration: null,
    organic_matter: null,
    key_nutrients: null,
    fertilizing: "Abono equilibrado en primavera y verano",
    deficiency_signs: [],
    container_suitability: "Buena",
  },
  pruning_maintenance: { when: null, what: "Hojas secas", tools: "Tijera desinfectada", shaping: null, flowering_fruiting: null, preventive: null, repotting_frequency: "Cada 2–3 años" },
  propagation: { methods: [{ method: "cutting" as const, how: "Esqueje con nudo y raíz aérea", rooting_or_germination_time: "3–6 semanas" }], young_plant_care: null },
  other: { difficulty: "easy" as const, experience_needed: null, maintenance_cost: null, lifespan: null, companions: [], safety_precautions: ["Savia irritante"] },
};

export const FIXTURE_IDENTIFICATION: Identification = {
  is_plant: true,
  subject_summary: "[DATOS DE PRUEBA] Hoja grande perforada de planta trepadora tropical.",
  image_quality: { usable: true, issues: [] },
  candidates: [
    {
      scientific_name: "Monstera deliciosa",
      authorship: "Liebm.",
      rank: "species",
      common_names: [{ name: "Costilla de Adán", language: "es", region: null }],
      family: "Araceae",
      genus: "Monstera",
      confidence_level: "high",
      confidence_score: 88,
      visual_evidence: ["Hojas pinnatifidas con perforaciones"],
      distinguishing_features: "Perforaciones y cortes hasta el margen",
    },
    {
      scientific_name: "Thaumatophyllum bipinnatifidum",
      authorship: null,
      rank: "species",
      common_names: [{ name: "Filodendro", language: "es", region: null }],
      family: "Araceae",
      genus: "Thaumatophyllum",
      confidence_level: "low",
      confidence_score: 10,
      visual_evidence: ["Hoja lobulada"],
      distinguishing_features: "No presenta perforaciones",
    },
  ],
  similar_species_differences: ["Monstera adansonii tiene hojas más pequeñas con agujeros cerrados"],
  additional_photos_needed: [],
  follow_up_questions: [],
  profile: {
    taxonomy: { kingdom: "Plantae", order: "Alismatales", family: "Araceae", genus: "Monstera", species: "deliciosa", infraspecific: null, cultivar: null },
    native_origin: "México y Centroamérica",
    native_distribution: null,
    habitat: null,
    plant_type: "Trepadora hemiepífita",
    life_cycle: "perennial",
    adult_height: null,
    adult_width: null,
    growth_rate: null,
    growth_habit: null,
    leaves: null,
    stem: null,
    flowers: null,
    flowering_season: null,
    fruits_seeds: null,
    lifespan: null,
    uses: ["Ornamental de interior"],
    toxicity: {
      humans: { status: "mildly_toxic", notes: "Oxalatos de calcio" },
      dogs: { status: "toxic", notes: null },
      cats: { status: "toxic", notes: null },
      other_animals: { status: "unknown", notes: null },
    },
    invasiveness: null,
    main_problems: ["Exceso de riego"],
    maintenance_tips: ["Limpiar el polvo de las hojas"],
    care,
  },
};

export const FIXTURE_DIAGNOSIS: Diagnosis = {
  plant_guess: "[DATOS DE PRUEBA] Tomate",
  image_quality: { usable: true, issues: [] },
  diagnosis_type: "visual_orientative",
  primary: {
    problem: "Oídio (posible)",
    category: "fungal",
    confidence_level: "medium",
    confidence_score: 60,
    severity: "moderate",
    supporting_symptoms: ["Polvo blanco en el haz"],
  },
  alternatives: [{ problem: "Residuos de cal o pulverizaciones", category: "other", confidence_level: "low", why_possible: "Manchas blancas", how_to_distinguish: "Se limpian con un paño" }],
  differentiating_questions: ["¿El polvo blanco se quita frotando?"],
  how_to_verify: ["Observar con lupa"],
  immediate_actions: ["Retirar hojas muy afectadas", "Mejorar la ventilación"],
  recovery_plan: [{ step: "Aislar", detail: "Separar de otras plantas", timeframe: "Hoy" }],
  prevention: ["Evitar mojar las hojas"],
  recovery_time: "2–4 semanas",
  improvement_signs: ["Hojas nuevas sanas"],
  failure_signs: ["Manchas en hojas nuevas"],
  isolate_or_remove: "Aislar mientras haya síntomas",
  when_to_call_professional: "Si afecta a todo el cultivo",
  chemical_options: [{ active_ingredient_or_type: "Azufre", purpose: "Fungicida", limitations: "No aplicar con calor", precautions: "Seguir la etiqueta" }],
};

export const FIXTURE_GARDEN: GardenDesign = {
  space_analysis: {
    summary: "[DATOS DE PRUEBA] Patio rectangular con suelo desnudo.",
    estimated_dimensions: "8 × 5 m (aportadas por el usuario)",
    dimensions_confidence: "high",
    surfaces_observed: ["Tierra"],
    existing_elements: [{ element: "Muro de bloque", keep: true, notes: null }],
    sun_shade_observations: "Orientación aportada por el usuario",
    slope_drainage_observations: "Sin pendiente aparente",
    circulation: "Acceso desde la vivienda",
    opportunities: ["Zona de estar"],
    constraints: ["Poco espacio"],
    data_needed_from_user: [],
  },
  plan_width_m: 8,
  plan_depth_m: 5,
  recommended_style: "mediterranean",
  style_rationale: "Clima seco",
  proposals: [
    {
      title: "Patio mediterráneo de bajo consumo",
      style: "mediterranean",
      concept: "Grava, aromáticas y sombra ligera",
      visual_description: "Macizos de lavanda junto a un camino de grava",
      zones: [
        { id: "z1", name: "Camino", purpose: "Paso", surface: "gravel", x_m: 0, y_m: 2, width_m: 8, depth_m: 1 },
        { id: "z2", name: "Macizo norte", purpose: "Plantación", surface: "planting_bed", x_m: 0, y_m: 0, width_m: 8, depth_m: 2 },
        { id: "z3", name: "Estar", purpose: "Descanso", surface: "seating", x_m: 0, y_m: 3, width_m: 4, depth_m: 2 },
      ],
      plants: [
        { scientific_name: "Lavandula angustifolia", common_name: "Lavanda", role: "shrub", quantity: 10, zone_id: "z2", spacing_m: 0.6, adult_size: "0,6 × 0,6 m", light: "Sol", water: "low", notes: null, toxicity_warning: null, invasive_warning: null },
      ],
      materials: [{ item: "Grava", quantity: "8 m²", notes: null }],
      lawn_or_groundcover: { choice: "Sin césped", rationale: "Ahorro de agua", alternatives: ["Tomillo rastrero"] },
      irrigation: "Goteo",
      drainage_soil: "Mejorar con arena",
      cost_estimate: {
        currency: "EUR",
        lines: [{ category: "plants", item: "Lavandas", low: 40, high: 80 }],
        tiers: {
          economy: { total_low: 300, total_high: 500, description: "Autoconstrucción" },
          balanced: { total_low: 600, total_high: 1000, description: "Mixto" },
          premium: { total_low: 1500, total_high: 2500, description: "Profesional" },
        },
      },
      phases: [{ phase: "Preparación", tasks: ["Limpiar"], season: "Otoño" }],
      maintenance: { monthly: ["Revisar goteo"], annual: ["Poda de lavanda"] },
      budget_alternatives: ["Esquejes propios"],
      mistakes_to_avoid: ["Regar en exceso"],
    },
  ],
};

export class FixtureProvider implements AiProvider {
  readonly id = "fixture";
  isConfigured() {
    return true;
  }
  async structured<T>(req: StructuredRequest<T>): Promise<StructuredResult<T>> {
    const data = req.task === "identify" ? FIXTURE_IDENTIFICATION : req.task === "diagnose" ? FIXTURE_DIAGNOSIS : FIXTURE_GARDEN;
    return {
      data: req.schema.parse(structuredClone(data)),
      usage: { provider: this.id, model: "fixture", inputTokens: 0, outputTokens: 0, cacheReadTokens: 0 },
      isTestFixture: true,
    };
  }
  async chat(req: ChatRequest): Promise<ChatResult> {
    const last = req.messages[req.messages.length - 1]?.content ?? "";
    return {
      text: `[RESPUESTA DE PRUEBA] He recibido tu pregunta: «${last.slice(0, 80)}».`,
      usage: { provider: this.id, model: "fixture", inputTokens: 0, outputTokens: 0, cacheReadTokens: 0 },
      isTestFixture: true,
    };
  }
}

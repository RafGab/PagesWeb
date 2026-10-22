import { z } from "zod";
import { ConfidenceLevel, ImageQuality } from "./common";

export const ProblemCategory = z.enum([
  "fungal",
  "bacterial",
  "viral",
  "pest_insect",
  "pest_mite",
  "mollusc",
  "nutrient_deficiency",
  "nutrient_excess",
  "water_stress_deficit",
  "water_stress_excess",
  "root_rot",
  "sunburn",
  "cold_frost",
  "heat_wind",
  "salinity_soil",
  "chemical_damage",
  "mechanical",
  "physiological_normal",
  "other",
]);

export const SeverityLevel = z.enum(["mild", "moderate", "severe", "urgent"]);

export const DiagnosisSchema = z.object({
  plant_guess: z.string().nullable(),
  image_quality: ImageQuality,
  diagnosis_type: z.literal("visual_orientative"),
  primary: z.object({
    problem: z.string(),
    category: ProblemCategory,
    confidence_level: ConfidenceLevel,
    confidence_score: z.number().describe("Estimación subjetiva 0-100"),
    severity: SeverityLevel,
    supporting_symptoms: z.array(z.string()),
  }),
  alternatives: z.array(
    z.object({
      problem: z.string(),
      category: ProblemCategory,
      confidence_level: ConfidenceLevel,
      why_possible: z.string(),
      how_to_distinguish: z.string(),
    }),
  ),
  differentiating_questions: z.array(z.string()),
  how_to_verify: z.array(z.string()),
  immediate_actions: z.array(z.string()),
  recovery_plan: z.array(z.object({ step: z.string(), detail: z.string(), timeframe: z.string().nullable() })),
  prevention: z.array(z.string()),
  recovery_time: z.string().nullable(),
  improvement_signs: z.array(z.string()),
  failure_signs: z.array(z.string()),
  isolate_or_remove: z.string(),
  when_to_call_professional: z.string(),
  chemical_options: z
    .array(
      z.object({
        active_ingredient_or_type: z.string(),
        purpose: z.string(),
        limitations: z.string(),
        precautions: z.string(),
      }),
    )
    .describe("Solo si es realmente necesario. Sin dosis ni mezclas."),
});

export type Diagnosis = z.infer<typeof DiagnosisSchema>;

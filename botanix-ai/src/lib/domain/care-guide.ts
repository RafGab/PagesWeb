import { z } from "zod";

const S = z.string().nullable();

export const CareGuideSchema = z.object({
  watering: z.object({
    frequency_guidance: z.string().describe("Orientación adaptable, nunca un calendario rígido"),
    amount_guidance: S,
    method: S,
    how_to_check: z.string(),
    underwatering_signs: z.array(z.string()),
    overwatering_signs: z.array(z.string()),
    seasonal_adjustments: S,
    drainage: S,
  }),
  light_temperature: z.object({
    exposure: z.enum(["full_sun", "part_shade", "shade", "bright_indirect", "varies"]),
    light_hours: S,
    optimal_temperature: S,
    heat_tolerance: S,
    cold_tolerance: S,
    min_temperature_c: z.number().nullable(),
    frost_risk: S,
    seasonal_protection: S,
  }),
  soil_nutrition: z.object({
    soil_type: S,
    ph: S,
    drainage_aeration: S,
    organic_matter: S,
    key_nutrients: S,
    fertilizing: S,
    deficiency_signs: z.array(z.string()),
    container_suitability: S,
  }),
  pruning_maintenance: z.object({
    when: S,
    what: S,
    tools: S,
    shaping: S,
    flowering_fruiting: S,
    preventive: S,
    repotting_frequency: S,
  }),
  propagation: z.object({
    methods: z.array(
      z.object({
        method: z.enum(["seed", "cutting", "division", "layering", "grafting", "offsets", "spores", "other"]),
        how: z.string(),
        rooting_or_germination_time: S,
      }),
    ),
    young_plant_care: S,
  }),
  other: z.object({
    difficulty: z.enum(["easy", "moderate", "hard", "expert"]),
    experience_needed: S,
    maintenance_cost: S,
    lifespan: S,
    companions: z.array(z.string()),
    safety_precautions: z.array(z.string()),
  }),
});

export type CareGuide = z.infer<typeof CareGuideSchema>;

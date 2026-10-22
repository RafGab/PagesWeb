import { z } from "zod";
import { ToxicityStatus } from "./common";
import { CareGuideSchema } from "./care-guide";

const S = z.string().nullable().describe("null si no hay información fiable");

const Toxicity = z.object({ status: ToxicityStatus, notes: S });

export const PlantProfileSchema = z.object({
  taxonomy: z.object({
    kingdom: S,
    order: S,
    family: S,
    genus: S,
    species: S,
    infraspecific: S.describe("subespecie o variedad botánica"),
    cultivar: S,
  }),
  native_origin: S,
  native_distribution: S,
  habitat: S,
  plant_type: S,
  life_cycle: z.enum(["annual", "biennial", "perennial", "variable", "unknown"]),
  adult_height: S,
  adult_width: S,
  growth_rate: S,
  growth_habit: S,
  leaves: S,
  stem: S,
  flowers: S,
  flowering_season: S,
  fruits_seeds: S,
  lifespan: S,
  uses: z.array(z.string()),
  toxicity: z.object({
    humans: Toxicity,
    dogs: Toxicity,
    cats: Toxicity,
    other_animals: Toxicity,
  }),
  invasiveness: S.describe("Riesgo de invasividad y territorios donde está regulada, si se conoce"),
  main_problems: z.array(z.string()),
  maintenance_tips: z.array(z.string()),
  care: CareGuideSchema,
});

export type PlantProfile = z.infer<typeof PlantProfileSchema>;

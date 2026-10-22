import { z } from "zod";
import { ConfidenceLevel, ImageQuality } from "./common";
import { PlantProfileSchema } from "./plant-profile";

export const CandidateSchema = z.object({
  scientific_name: z.string().describe("Binomio (o género si no se puede llegar a especie), sin autor"),
  authorship: z.string().nullable(),
  rank: z.enum(["species", "infraspecific", "cultivar", "genus", "family"]),
  common_names: z.array(z.object({ name: z.string(), language: z.string(), region: z.string().nullable() })),
  family: z.string().nullable(),
  genus: z.string().nullable(),
  confidence_level: ConfidenceLevel,
  confidence_score: z.number().describe("Estimación subjetiva 0-100, no probabilidad calibrada"),
  visual_evidence: z.array(z.string()),
  distinguishing_features: z.string().nullable(),
});

export const IdentificationSchema = z.object({
  is_plant: z.boolean(),
  subject_summary: z.string(),
  image_quality: ImageQuality,
  candidates: z.array(CandidateSchema),
  similar_species_differences: z.array(z.string()),
  additional_photos_needed: z.array(z.string()),
  follow_up_questions: z.array(z.string()),
  profile: PlantProfileSchema.nullable().describe("Ficha del candidato principal; null si la identificación es demasiado incierta"),
});

export type Identification = z.infer<typeof IdentificationSchema>;
export type Candidate = z.infer<typeof CandidateSchema>;

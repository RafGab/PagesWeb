import { z } from "zod";
import { ConfidenceLevel } from "./common";

export { GARDEN_STYLES, type GardenStyle } from "./garden-styles";

export const SurfaceType = z.enum([
  "lawn",
  "planting_bed",
  "gravel",
  "paving",
  "deck",
  "water",
  "vegetable_bed",
  "path",
  "tree_area",
  "meadow",
  "groundcover",
  "seating",
  "other",
]);
export type SurfaceType = z.infer<typeof SurfaceType>;

const Money = z.number().describe("Importe orientativo en la moneda indicada");

export const ProposalSchema = z.object({
  title: z.string(),
  style: z.string(),
  concept: z.string(),
  visual_description: z.string(),
  zones: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      purpose: z.string(),
      surface: SurfaceType,
      x_m: z.number().describe("Esquina superior izquierda, metros desde el origen del plano"),
      y_m: z.number(),
      width_m: z.number(),
      depth_m: z.number(),
    }),
  ),
  plants: z.array(
    z.object({
      scientific_name: z.string(),
      common_name: z.string(),
      role: z.enum(["tree", "shrub", "hedge", "perennial", "grass", "groundcover", "climber", "vegetable", "herb", "bulb", "succulent", "aquatic", "annual"]),
      quantity: z.number(),
      zone_id: z.string(),
      spacing_m: z.number().nullable(),
      adult_size: z.string(),
      light: z.string(),
      water: z.enum(["low", "medium", "high"]),
      notes: z.string().nullable(),
      toxicity_warning: z.string().nullable(),
      invasive_warning: z.string().nullable(),
    }),
  ),
  materials: z.array(z.object({ item: z.string(), quantity: z.string().nullable(), notes: z.string().nullable() })),
  lawn_or_groundcover: z.object({ choice: z.string(), rationale: z.string(), alternatives: z.array(z.string()) }),
  irrigation: z.string(),
  drainage_soil: z.string(),
  cost_estimate: z.object({
    currency: z.string().describe("Código ISO 4217"),
    lines: z.array(
      z.object({
        category: z.enum(["plants", "materials", "labor", "maintenance"]),
        item: z.string(),
        low: Money,
        high: Money,
      }),
    ),
    tiers: z.object({
      economy: z.object({ total_low: Money, total_high: Money, description: z.string() }),
      balanced: z.object({ total_low: Money, total_high: Money, description: z.string() }),
      premium: z.object({ total_low: Money, total_high: Money, description: z.string() }),
    }),
  }),
  phases: z.array(z.object({ phase: z.string(), tasks: z.array(z.string()), season: z.string().nullable() })),
  maintenance: z.object({ monthly: z.array(z.string()), annual: z.array(z.string()) }),
  budget_alternatives: z.array(z.string()),
  mistakes_to_avoid: z.array(z.string()),
});

export const GardenDesignSchema = z.object({
  space_analysis: z.object({
    summary: z.string(),
    estimated_dimensions: z.string().nullable(),
    dimensions_confidence: ConfidenceLevel,
    surfaces_observed: z.array(z.string()),
    existing_elements: z.array(z.object({ element: z.string(), keep: z.boolean(), notes: z.string().nullable() })),
    sun_shade_observations: z.string(),
    slope_drainage_observations: z.string(),
    circulation: z.string(),
    opportunities: z.array(z.string()),
    constraints: z.array(z.string()),
    data_needed_from_user: z.array(z.string()),
  }),
  plan_width_m: z.number().nullable(),
  plan_depth_m: z.number().nullable(),
  recommended_style: z.string(),
  style_rationale: z.string(),
  proposals: z.array(ProposalSchema),
});

export type GardenDesign = z.infer<typeof GardenDesignSchema>;
export type Proposal = z.infer<typeof ProposalSchema>;

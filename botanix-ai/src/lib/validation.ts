import { z } from "zod";

// Esquemas de entrada compartidos entre rutas.
export const LocationBody = z.object({
  label: z.string().trim().min(1).max(60),
  country: z.string().trim().length(2).toUpperCase(),
  countryName: z.string().trim().min(1).max(80),
  region: z.string().trim().max(120).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  postalCode: z.string().trim().max(20).nullable().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  elevationM: z.number().min(-500).max(9000).nullable().optional(),
  timezone: z.string().max(60).nullable().optional(),
  notes: z.string().trim().max(300).nullable().optional(),
  isDefault: z.boolean().optional(),
});

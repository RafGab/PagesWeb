import { z } from "zod";

// Nivel cualitativo: la puntuación numérica es una estimación del modelo, no una probabilidad calibrada.
export const ConfidenceLevel = z.enum(["high", "medium", "low"]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevel>;

export const ImageQuality = z.object({
  usable: z.boolean(),
  issues: z.array(z.string()).describe("Problemas de la foto: desenfoque, poca luz, encuadre, órgano no visible…"),
});

export const ToxicityStatus = z.enum(["toxic", "mildly_toxic", "non_toxic", "unknown"]);

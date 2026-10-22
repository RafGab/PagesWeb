// Estilos de jardín (sin dependencias, utilizable en el cliente).
export const GARDEN_STYLES = [
  "mediterranean",
  "english",
  "japanese",
  "tropical",
  "modern_minimalist",
  "rustic",
  "naturalistic",
  "low_maintenance",
  "sustainable",
  "pollinator",
  "native",
  "family_kids_pets",
  "edible",
  "ornamental_vegetable",
  "water_wise",
  "recommend",
] as const;
export type GardenStyle = (typeof GARDEN_STYLES)[number];

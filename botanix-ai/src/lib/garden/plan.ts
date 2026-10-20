import type { Proposal, SurfaceType } from "@/lib/domain/garden-design";

export const SURFACE_STYLE: Record<SurfaceType, { fill: string; label: { es: string; en: string } }> = {
  lawn: { fill: "#9CC27E", label: { es: "Césped", en: "Lawn" } },
  planting_bed: { fill: "#5E8C55", label: { es: "Macizo", en: "Planting bed" } },
  gravel: { fill: "#D8CDB8", label: { es: "Grava", en: "Gravel" } },
  paving: { fill: "#BDB5A6", label: { es: "Pavimento", en: "Paving" } },
  deck: { fill: "#B88A5A", label: { es: "Tarima", en: "Deck" } },
  water: { fill: "#7FB3C8", label: { es: "Agua", en: "Water" } },
  vegetable_bed: { fill: "#8A6E45", label: { es: "Huerto", en: "Vegetable bed" } },
  path: { fill: "#E6DCC6", label: { es: "Camino", en: "Path" } },
  tree_area: { fill: "#3F6B45", label: { es: "Árboles", en: "Trees" } },
  meadow: { fill: "#B9C98A", label: { es: "Pradera", en: "Meadow" } },
  groundcover: { fill: "#7BA36A", label: { es: "Tapizante", en: "Groundcover" } },
  seating: { fill: "#C9B08A", label: { es: "Estar", en: "Seating" } },
  other: { fill: "#CFCFC4", label: { es: "Otro", en: "Other" } },
};

/** Dimensiones del lienzo: medidas reales si existen; si no, la envolvente de las zonas. */
export function planBounds(p: Proposal, width: number | null, depth: number | null) {
  const maxX = Math.max(1, ...p.zones.map((z) => z.x_m + z.width_m));
  const maxY = Math.max(1, ...p.zones.map((z) => z.y_m + z.depth_m));
  return { W: width && width > 0 ? width : maxX, D: depth && depth > 0 ? depth : maxY, scaled: Boolean(width && depth) };
}

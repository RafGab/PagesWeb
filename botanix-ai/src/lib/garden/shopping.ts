import type { Proposal, SurfaceType } from "@/lib/domain/garden-design";

export interface ShoppingRow {
  category: "plants" | "soil" | "materials" | "lawn" | "irrigation";
  item: string;
  quantity: string;
  basis: string; // de dónde sale la cantidad
}

const area = (z: Proposal["zones"][number]) => z.width_m * z.depth_m;
const r1 = (x: number) => Math.round(x * 10) / 10;

/** Lista de compra: plantas de la propuesta + cantidades de suelo calculadas a partir de las zonas. */
export function shoppingList(p: Proposal): ShoppingRow[] {
  const rows: ShoppingRow[] = [];
  const byName = new Map<string, { q: number; sci: string }>();
  for (const pl of p.plants) {
    const k = `${pl.common_name}|${pl.scientific_name}`;
    byName.set(k, { q: (byName.get(k)?.q ?? 0) + pl.quantity, sci: pl.scientific_name });
  }
  for (const [k, { q, sci }] of byName) rows.push({ category: "plants", item: `${k.split("|")[0]} (${sci})`, quantity: `${q} ud.`, basis: "Propuesta" });

  const sum = (types: SurfaceType[]) => p.zones.filter((z) => types.includes(z.surface)).reduce((a, z) => a + area(z), 0);
  const beds = sum(["planting_bed", "vegetable_bed", "tree_area"]);
  const gravel = sum(["gravel", "path"]);
  const lawn = sum(["lawn", "meadow"]);
  if (beds > 0) {
    rows.push({ category: "soil", item: "Compost maduro (capa de 5 cm incorporada)", quantity: `${r1(beds * 0.05)} m³`, basis: `${r1(beds)} m² de macizos × 0,05 m` });
    rows.push({ category: "soil", item: "Acolchado (corteza o restos de poda, 7 cm)", quantity: `${r1(beds * 0.07)} m³`, basis: `${r1(beds)} m² × 0,07 m` });
  }
  if (gravel > 0) {
    rows.push({ category: "materials", item: "Grava o gravilla (capa de 5 cm)", quantity: `${r1(gravel * 0.05)} m³`, basis: `${r1(gravel)} m² × 0,05 m` });
    rows.push({ category: "materials", item: "Malla antihierbas permeable", quantity: `${Math.ceil(gravel * 1.1)} m²`, basis: "Superficie + 10 % de solapes" });
  }
  if (lawn > 0) {
    rows.push({ category: "lawn", item: `Semilla de césped: ${p.lawn_or_groundcover.choice}`, quantity: `${Math.round(lawn * 0.025)}–${Math.round(lawn * 0.04)} kg`, basis: `${r1(lawn)} m² a 25–40 g/m² (según la especie: consulta el envase)` });
    rows.push({ category: "lawn", item: "Alternativa en tepes", quantity: `${Math.ceil(lawn * 1.05)} m²`, basis: "Superficie + 5 % de recortes" });
  }
  for (const m of p.materials) rows.push({ category: "materials", item: m.item, quantity: m.quantity ?? "—", basis: m.notes ?? "Propuesta" });
  return rows;
}

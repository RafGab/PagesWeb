import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";
import { shoppingList } from "@/lib/garden/shopping";
import { toCsv } from "@/lib/exports/csv";
import type { GardenDesign } from "@/lib/domain/garden-design";

const Q = z.object({ versionId: z.string().max(40), proposal: z.coerce.number().int().min(0).max(5).default(0) });

export const GET = route(async (req) => {
  const user = await requireUser();
  const q = Q.parse(Object.fromEntries(new URL(req.url).searchParams));
  const v = await db.designVersion.findFirst({ where: { id: q.versionId, design: { userId: user.id } } });
  if (!v) throw new AppError("NOT_FOUND", "Versión no encontrada.");
  const design = v.proposal as unknown as GardenDesign;
  const p = design.proposals[q.proposal];
  if (!p) throw new AppError("NOT_FOUND", "Propuesta no encontrada.");
  const rows: (string | number)[][] = [["Categoría", "Artículo", "Cantidad", "Base del cálculo"]];
  for (const r of shoppingList(p)) rows.push([r.category, r.item, r.quantity, r.basis]);
  rows.push([]);
  rows.push(["Presupuesto orientativo", "Partida", `Mínimo (${p.cost_estimate.currency})`, `Máximo (${p.cost_estimate.currency})`]);
  for (const l of p.cost_estimate.lines) rows.push([l.category, l.item, l.low, l.high]);
  rows.push([]);
  rows.push(["Estimaciones orientativas generadas por IA: no son precios actuales ni confirman disponibilidad."]);
  if (v.isTestFixture) rows.push(["DATOS DE PRUEBA"]);
  return new Response(toCsv(rows), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="lista-compra-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.csv"` } });
});

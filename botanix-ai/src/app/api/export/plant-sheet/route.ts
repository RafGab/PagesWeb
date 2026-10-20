import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";
import { plantSheetMarkdown } from "@/lib/exports/plant-sheet";
import type { Identification } from "@/lib/domain/identification";
import type { NameVerification } from "@/lib/taxonomy/gbif";

const Q = z.object({ analysisId: z.string().max(40) });

export const GET = route(async (req) => {
  const user = await requireUser();
  const { analysisId } = Q.parse(Object.fromEntries(new URL(req.url).searchParams));
  const a = await db.analysis.findFirst({ where: { id: analysisId, userId: user.id, kind: "IDENTIFY", status: "COMPLETED" } });
  if (!a) throw new AppError("NOT_FOUND", "Análisis no encontrado.");
  const r = a.result as unknown as { identification: Identification; verification: NameVerification[] };
  const md = plantSheetMarkdown(r.identification, r.verification ?? [], a.warnings, a.completedAt ?? a.createdAt, a.isTestFixture);
  const slug = (r.identification.candidates[0]?.scientific_name ?? "planta").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return new Response(md, { headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": `attachment; filename="ficha-${slug}.md"` } });
});

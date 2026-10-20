import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/auth/session";
import { enforceRateLimit, route } from "@/lib/security/http";
import { CROPS } from "@/lib/sowing/crops";
import { GbifClient } from "@/lib/taxonomy/gbif";

const Q = z.object({ q: z.string().trim().min(2).max(100) });
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

// Términos de características/uso que se resuelven con los datos curados del motor de siembra.
const TRAITS: Record<string, (c: (typeof CROPS)[number]) => boolean> = {
  sombra: (c) => c.params.sun === "part_shade", shade: (c) => c.params.sun === "part_shade",
  sequia: (c) => c.params.water === "low", drought: (c) => c.params.water === "low",
  facil: (c) => c.params.difficulty === "easy", easy: (c) => c.params.difficulty === "easy",
  frutal: (c) => c.category === "fruit_tree" || c.category === "fruit_perennial", fruit: (c) => c.category === "fruit_tree" || c.category === "fruit_perennial",
  aromatica: (c) => c.category === "herb", herb: (c) => c.category === "herb",
  flor: (c) => c.category === "flower", flower: (c) => c.category === "flower",
  cesped: (c) => c.category === "lawn", lawn: (c) => c.category === "lawn",
  huerto: (c) => c.category === "vegetable", vegetable: (c) => c.category === "vegetable",
  tropical: (c) => c.params.kind === "perennial" && c.params.minColdMonthMeanC !== null,
};

export const GET = route(async (req) => {
  const user = await requireUser();
  enforceRateLimit(`search:${user.id}`, 60, 60_000);
  const { q } = Q.parse(Object.fromEntries(new URL(req.url).searchParams));
  const nq = norm(q);
  const trait = Object.entries(TRAITS).find(([k]) => nq.includes(k))?.[1];
  const crops = CROPS.filter((c) => (trait ? trait(c) : false) || norm(c.names.es).includes(nq) || norm(c.names.en).includes(nq) || norm(c.scientificName).includes(nq)).map((c) => ({
    slug: c.slug, category: c.category, scientificName: c.scientificName, name: user.locale === "en" ? c.names.en : c.names.es,
  }));
  const taxa = await db.taxon.findMany({
    where: {
      OR: [
        { scientificName: { contains: q, mode: "insensitive" } },
        { family: { contains: q, mode: "insensitive" } },
        { genus: { contains: q, mode: "insensitive" } },
        { commonNames: { some: { name: { contains: q, mode: "insensitive" } } } },
        { synonyms: { some: { name: { contains: q, mode: "insensitive" } } } },
      ],
    },
    take: 20,
    include: { commonNames: { take: 3 }, profiles: { select: { id: true, locale: true } } },
  });
  const gbif = env().TAXONOMY_PROVIDER === "gbif" && env().CLIMATE_PROVIDER !== "fixture" ? await new GbifClient().search(q, 15) : null;
  return NextResponse.json({ crops, taxa, gbif, gbifAvailable: gbif !== null });
});

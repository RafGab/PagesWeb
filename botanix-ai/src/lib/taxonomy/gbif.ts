import { z } from "zod";

// Verificación de nombres contra el backbone taxonómico de GBIF (sin clave; datos CC BY 4.0).
// GBIF es una autoridad de nombres, no de cultivo, toxicidad ni sanidad vegetal.
const PLANTAE_KEY = 6;

const MatchSchema = z.object({
  usageKey: z.number().optional(),
  acceptedUsageKey: z.number().optional(),
  scientificName: z.string().optional(),
  canonicalName: z.string().optional(),
  rank: z.string().optional(),
  status: z.string().optional(),
  matchType: z.string(),
  confidence: z.number().optional(),
  kingdom: z.string().optional(),
  phylum: z.string().optional(),
  class: z.string().optional(),
  order: z.string().optional(),
  family: z.string().optional(),
  genus: z.string().optional(),
  species: z.string().optional(),
});

export interface NameVerification {
  provider: "gbif";
  status: "accepted" | "synonym" | "doubtful" | "fuzzy" | "higher_rank" | "not_found" | "unavailable";
  queriedName: string;
  matchedName: string | null;
  acceptedName: string | null;
  authorship: string | null;
  gbifKey: number | null;
  rank: string | null;
  kingdom: string | null;
  phylum: string | null;
  className: string | null;
  order: string | null;
  family: string | null;
  genus: string | null;
  referenceUrl: string | null;
  retrievedAt: string;
}

const SearchSchema = z.object({
  results: z.array(
    z.object({
      key: z.number(),
      scientificName: z.string(),
      canonicalName: z.string().optional(),
      rank: z.string().optional(),
      family: z.string().optional(),
      genus: z.string().optional(),
      taxonomicStatus: z.string().optional(),
      vernacularNames: z.array(z.object({ vernacularName: z.string(), language: z.string().optional() })).optional(),
    }),
  ),
});

export type GbifSearchHit = z.infer<typeof SearchSchema>["results"][number];
type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export class GbifClient {
  constructor(
    private fetcher: FetchLike = fetch,
    private base = "https://api.gbif.org/v1",
  ) {}

  async verify(name: string): Promise<NameVerification> {
    const retrievedAt = new Date().toISOString();
    const empty = { matchedName: null, acceptedName: null, authorship: null, gbifKey: null, rank: null, kingdom: null, phylum: null, className: null, order: null, family: null, genus: null, referenceUrl: null };
    let raw: unknown;
    try {
      const res = await this.fetcher(`${this.base}/species/match?name=${encodeURIComponent(name)}&kingdom=Plantae&strict=false`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return { provider: "gbif", status: "unavailable", queriedName: name, ...empty, retrievedAt };
      raw = await res.json();
    } catch {
      return { provider: "gbif", status: "unavailable", queriedName: name, ...empty, retrievedAt };
    }
    const m = MatchSchema.safeParse(raw);
    if (!m.success || m.data.matchType === "NONE" || !m.data.usageKey) return { provider: "gbif", status: "not_found", queriedName: name, ...empty, retrievedAt };
    const d = m.data;
    if (d.kingdom && d.kingdom !== "Plantae") return { provider: "gbif", status: "not_found", queriedName: name, ...empty, retrievedAt };
    const authorship = d.scientificName && d.canonicalName && d.scientificName.startsWith(d.canonicalName) ? d.scientificName.slice(d.canonicalName.length).trim() || null : null;
    const status: NameVerification["status"] =
      d.matchType === "HIGHERRANK" ? "higher_rank" : d.matchType === "FUZZY" ? "fuzzy" : d.status === "SYNONYM" ? "synonym" : d.status === "DOUBTFUL" ? "doubtful" : "accepted";
    return {
      provider: "gbif",
      status,
      queriedName: name,
      matchedName: d.canonicalName ?? null,
      acceptedName: d.status === "SYNONYM" ? (d.species ?? null) : (d.canonicalName ?? null),
      authorship,
      gbifKey: d.acceptedUsageKey ?? d.usageKey ?? null,
      rank: d.rank ?? null,
      kingdom: d.kingdom ?? null,
      phylum: d.phylum ?? null,
      className: d.class ?? null,
      order: d.order ?? null,
      family: d.family ?? null,
      genus: d.genus ?? null,
      referenceUrl: `https://www.gbif.org/species/${d.acceptedUsageKey ?? d.usageKey}`,
      retrievedAt,
    };
  }

  async search(q: string, limit = 20): Promise<GbifSearchHit[] | null> {
    try {
      const res = await this.fetcher(`${this.base}/species/search?q=${encodeURIComponent(q)}&highertaxonKey=${PLANTAE_KEY}&status=ACCEPTED&limit=${limit}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return null;
      return SearchSchema.parse(await res.json()).results;
    } catch {
      return null;
    }
  }
}

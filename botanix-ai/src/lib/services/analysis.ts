import "server-only";
import { createHash } from "node:crypto";
import type { AnalysisKind, Prisma, Severity, User } from "@prisma/client";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { aiProvider } from "@/lib/ai/registry";
import { notConfigured } from "@/lib/ai/providers/unconfigured";
import { guardDiagnosis, guardGardenDesign, guardIdentification } from "@/lib/ai/guardrails";
import { IDENTIFY_PROMPT_VERSION, identifySystem, identifyUser } from "@/lib/ai/prompts/identify";
import { DIAGNOSE_PROMPT_VERSION, diagnoseSystem, diagnoseUser } from "@/lib/ai/prompts/diagnose";
import { GARDEN_PROMPT_VERSION, gardenSystem, gardenUser } from "@/lib/ai/prompts/garden";
import { IdentificationSchema, type Identification } from "@/lib/domain/identification";
import { DiagnosisSchema } from "@/lib/domain/diagnosis";
import { GardenDesignSchema } from "@/lib/domain/garden-design";
import { GbifClient, type NameVerification } from "@/lib/taxonomy/gbif";
import { PLANS } from "@/lib/plans";
import { storage } from "@/lib/storage";
import { getOwnedPhotos } from "./photos";
import { assertWithinLimits, recordUsage } from "./usage";
import { buildAiContext } from "./context";
import type { AiImage } from "@/lib/ai/types";

const PROMPT_VERSION: Record<AnalysisKind, string> = {
  IDENTIFY: IDENTIFY_PROMPT_VERSION,
  DIAGNOSE: DIAGNOSE_PROMPT_VERSION,
  GARDEN_SPACE: GARDEN_PROMPT_VERSION,
};
const CACHE_DAYS = 30;

export interface CreateAnalysisInput {
  user: User;
  kind: AnalysisKind;
  photoIds: string[];
  userContext: Record<string, unknown>;
  locationId?: string | null;
}

function inputHash(kind: AnalysisKind, photoHashes: string[], ctx: unknown) {
  return createHash("sha256").update(JSON.stringify([kind, PROMPT_VERSION[kind], photoHashes, ctx])).digest("hex");
}

/** Crea el análisis (o devuelve uno idéntico reciente) y valida permisos, consentimiento y límites. */
export async function createAnalysis(input: CreateAnalysisInput) {
  const { user, kind } = input;
  const provider = aiProvider();
  if (!provider.isConfigured()) throw notConfigured();
  if (input.photoIds.length && !user.imageConsentAt) throw new AppError("FORBIDDEN", "Debes aceptar el procesamiento de fotos con IA en tu perfil.");
  if (kind !== "GARDEN_SPACE" && input.photoIds.length === 0) throw new AppError("VALIDATION", "Añade al menos una foto.");
  const max = PLANS[user.plan].maxPhotosPerAnalysis;
  if (input.photoIds.length > max) throw new AppError("VALIDATION", `Máximo ${max} fotos por análisis en tu plan.`);

  const photos = await getOwnedPhotos(user.id, input.photoIds);
  const hash = inputHash(kind, photos.map((p) => p.sha256), { ...input.userContext, locationId: input.locationId ?? null, locale: user.locale });

  // Caché: no se repite (ni se cobra) un análisis idéntico reciente.
  if (kind !== "GARDEN_SPACE") {
    const cached = await db.analysis.findFirst({
      where: { userId: user.id, inputHash: hash, status: "COMPLETED", createdAt: { gte: new Date(Date.now() - CACHE_DAYS * 86_400_000) } },
      orderBy: { createdAt: "desc" },
    });
    if (cached) return { analysis: cached, cached: true };
  }

  await assertWithinLimits(user, kind === "GARDEN_SPACE" ? "garden" : "analysis", kind);
  const analysis = await db.analysis.create({
    data: {
      userId: user.id,
      kind,
      promptVersion: PROMPT_VERSION[kind],
      inputHash: hash,
      context: { ...input.userContext, locationId: input.locationId ?? null } as Prisma.InputJsonValue,
      provider: provider.id,
      photos: { create: photos.map((p, i) => ({ photoId: p.id, position: i })) },
    },
  });
  return { analysis, cached: false };
}

async function loadImages(analysisId: string): Promise<AiImage[]> {
  const links = await db.analysisPhoto.findMany({ where: { analysisId }, include: { photo: true }, orderBy: { position: "asc" } });
  const images: AiImage[] = [];
  for (const l of links) {
    const buf = await storage().get(l.photo.storageKey);
    if (!buf) throw new AppError("NOT_FOUND", "Una de las fotos ya no está disponible.");
    images.push({ mediaType: "image/jpeg", base64: buf.toString("base64") });
  }
  return images;
}

const SEVERITY: Record<string, Severity> = { mild: "MILD", moderate: "MODERATE", severe: "SEVERE", urgent: "URGENT" };

/** Ejecuta el análisis. Pensado para correr en segundo plano (after()) o directamente en pruebas. */
export async function processAnalysis(analysisId: string) {
  const analysis = await db.analysis.findUnique({ where: { id: analysisId }, include: { user: true } });
  if (!analysis || analysis.status === "COMPLETED") return;
  await db.analysis.update({ where: { id: analysisId }, data: { status: "PROCESSING" } });
  const user = analysis.user;
  const locale = user.locale === "en" ? "en" : "es";
  const stored = (analysis.context ?? {}) as Record<string, unknown>;
  const { locationId, designId, changeRequest, previousVersionId, userPlantId, ...answers } = stored as Record<string, unknown> & {
    locationId?: string | null;
    designId?: string;
    changeRequest?: string;
    previousVersionId?: string;
    userPlantId?: string;
  };

  try {
    const provider = aiProvider();
    const images = await loadImages(analysisId);
    const { ctx } = await buildAiContext(user, locationId ?? null);
    const fullCtx = { ...ctx, ...answers };
    let result: Record<string, unknown>;
    let warnings: string[] = [];
    let isTestFixture = false;
    let taxonId: string | null = null;

    if (analysis.kind === "IDENTIFY") {
      const r = await provider.structured({ task: "identify", system: identifySystem(locale), userText: identifyUser(fullCtx), images, schema: IdentificationSchema, maxTokens: 16000 });
      await recordUsage(user.id, "identify", r.usage, analysisId);
      const g = guardIdentification(r.data);
      const verification = await verifyCandidates(g.data);
      warnings = g.warnings;
      for (const v of verification) if (v.status === "synonym" && v.acceptedName) warnings.push(`«${v.queriedName}» figura como sinónimo en GBIF; nombre aceptado: ${v.acceptedName}.`);
      if (verification[0]?.status === "not_found") warnings.push(`El nombre «${verification[0].queriedName}» no se encontró en el backbone de GBIF: trátalo con cautela.`);
      taxonId = await persistTaxon(g.data, verification[0] ?? null, locale);
      result = { identification: g.data, verification };
      isTestFixture = r.isTestFixture;
    } else if (analysis.kind === "DIAGNOSE") {
      const r = await provider.structured({ task: "diagnose", system: diagnoseSystem(locale), userText: diagnoseUser(fullCtx), images, schema: DiagnosisSchema, maxTokens: 16000 });
      await recordUsage(user.id, "diagnose", r.usage, analysisId);
      const g = guardDiagnosis(r.data);
      warnings = g.warnings;
      result = { diagnosis: g.data };
      isTestFixture = r.isTestFixture;
      const plant = userPlantId ? await db.userPlant.findFirst({ where: { id: userPlantId, userId: user.id } }) : null;
      await db.diagnosis.create({
        data: { analysisId, userPlantId: plant?.id ?? null, primaryProblem: g.data.primary.problem, severity: SEVERITY[g.data.primary.severity], confirmation: "visual_orientative" },
      });
    } else {
      const design = designId ? await db.gardenDesign.findFirst({ where: { id: designId, userId: user.id } }) : null;
      if (!design) throw new AppError("NOT_FOUND", "Diseño no encontrado.");
      const previous = previousVersionId ? await db.designVersion.findFirst({ where: { id: previousVersionId, designId: design.id } }) : null;
      const r = await provider.structured({
        task: "garden_design",
        system: gardenSystem(locale),
        userText: gardenUser({ ...fullCtx, ...(design.inputs as object) }, previous?.proposal, changeRequest),
        images,
        schema: GardenDesignSchema,
        maxTokens: 32000,
      });
      await recordUsage(user.id, "garden_design", r.usage, analysisId);
      const g = guardGardenDesign(r.data);
      warnings = g.warnings;
      isTestFixture = r.isTestFixture;
      const last = await db.designVersion.findFirst({ where: { designId: design.id }, orderBy: { version: "desc" } });
      const version = await db.designVersion.create({
        data: { designId: design.id, version: (last?.version ?? 0) + 1, promptVersion: GARDEN_PROMPT_VERSION, proposal: g.data as Prisma.InputJsonValue, changeRequest: changeRequest ?? null, isTestFixture },
      });
      result = { designId: design.id, versionId: version.id, version: version.version };
    }

    await db.analysis.update({
      where: { id: analysisId },
      data: { status: "COMPLETED", result: result as Prisma.InputJsonValue, warnings, isTestFixture, completedAt: new Date(), taxonId },
    });
  } catch (err) {
    const code = err instanceof AppError ? err.code : "INTERNAL";
    const message = err instanceof AppError ? err.message : "Error inesperado durante el análisis.";
    if (!(err instanceof AppError)) console.error("[botanix] fallo de análisis:", err instanceof Error ? err.message : "desconocido");
    await db.analysis.update({ where: { id: analysisId }, data: { status: code === "AI_NOT_CONFIGURED" ? "NOT_CONFIGURED" : "FAILED", errorCode: code, errorMessage: message, completedAt: new Date() } });
  }
}

async function verifyCandidates(id: Identification): Promise<NameVerification[]> {
  if (env().TAXONOMY_PROVIDER !== "gbif" || env().AI_PROVIDER === "fixture") return [];
  const gbif = new GbifClient();
  return Promise.all(id.candidates.slice(0, 3).map((c) => gbif.verify(c.scientific_name)));
}

/** Guarda el taxón principal y su ficha IA (solo si la identificación es al menos media). */
async function persistTaxon(id: Identification, v: NameVerification | null, locale: string): Promise<string | null> {
  const top = id.candidates[0];
  if (!top || top.confidence_level === "low") return null;
  const verified = v && (v.status === "accepted" || v.status === "synonym") ? v : null;
  const scientificName = verified?.acceptedName ?? top.scientific_name;
  const rank = (verified?.rank ?? top.rank).toUpperCase();
  const taxon = await db.taxon.upsert({
    where: { scientificName_rank: { scientificName, rank } },
    create: {
      scientificName,
      rank,
      authorship: verified?.authorship ?? top.authorship,
      kingdom: verified?.kingdom ?? id.profile?.taxonomy.kingdom ?? "Plantae",
      phylum: verified?.phylum ?? null,
      className: verified?.className ?? null,
      orderName: verified?.order ?? id.profile?.taxonomy.order ?? null,
      family: verified?.family ?? top.family,
      genus: verified?.genus ?? top.genus,
      species: id.profile?.taxonomy.species ?? null,
      gbifKey: verified?.gbifKey ?? null,
      taxonomicStatus: verified ? "ACCEPTED" : null,
    },
    update: {},
  });
  if (verified?.status === "synonym" && verified.matchedName && verified.matchedName !== scientificName) {
    await db.taxonSynonym.upsert({
      where: { taxonId_name: { taxonId: taxon.id, name: verified.matchedName } },
      create: { taxonId: taxon.id, name: verified.matchedName, source: "gbif" },
      update: {},
    });
  }
  for (const cn of top.common_names.slice(0, 8)) {
    const country = cn.region && /^[A-Z]{2}$/.test(cn.region) ? cn.region : "";
    await db.commonName.upsert({
      where: { taxonId_name_language_country: { taxonId: taxon.id, name: cn.name, language: cn.language.slice(0, 5), country } },
      create: { taxonId: taxon.id, name: cn.name, language: cn.language.slice(0, 5), country, source: "ai" },
      update: {},
    }).catch(() => undefined);
  }
  if (id.profile && top.confidence_level === "high") {
    await db.plantProfile.upsert({
      where: { taxonId_locale_origin: { taxonId: taxon.id, locale, origin: "ai_generated" } },
      create: { taxonId: taxon.id, locale, origin: "ai_generated", promptVersion: IDENTIFY_PROMPT_VERSION, data: id.profile as Prisma.InputJsonValue },
      update: { data: id.profile as Prisma.InputJsonValue, promptVersion: IDENTIFY_PROMPT_VERSION },
    });
  }
  return taxon.id;
}

// Datos iniciales: fuentes de referencia y cultivos del motor de siembra.
// Con SEED_DEMO_USER=1 crea además una cuenta de demostración identificada como DATOS DE PRUEBA.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CROPS } from "../src/lib/sowing/crops";
import { CROP_SOURCES } from "../src/lib/sowing/sources";

const db = new PrismaClient();

async function main() {
  const sourceIds: Record<string, string> = {};
  for (const s of Object.values(CROP_SOURCES)) {
    const existing = await db.dataSource.findFirst({ where: { provider: `curated:${s.id}` } });
    const row = existing ?? (await db.dataSource.create({ data: { provider: `curated:${s.id}`, referenceUrl: s.url, confidence: "orientativa", limitations: `${s.title}. ${s.note}` } }));
    sourceIds[s.id] = row.id;
  }
  for (const c of CROPS) {
    await db.crop.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, category: c.category, scientificName: c.scientificName, names: { ...c.names }, params: c.params as object, sourceId: sourceIds[c.sourceIds[0]] },
      update: { category: c.category, scientificName: c.scientificName, names: { ...c.names }, params: c.params as object, sourceId: sourceIds[c.sourceIds[0]] },
    });
  }
  console.log(`Fuentes: ${Object.keys(sourceIds).length} · Cultivos: ${CROPS.length}`);

  if (process.env.SEED_DEMO_USER === "1") {
    const email = "demo@botanix.test";
    const user = await db.user.upsert({
      where: { email },
      create: { email, passwordHash: await bcrypt.hash("demo-botanix-2026", 12), name: "Demo (datos de prueba)", termsAcceptedAt: new Date(), imageConsentAt: new Date() },
      update: {},
    });
    if (!(await db.location.findFirst({ where: { userId: user.id } }))) {
      await db.location.create({ data: { userId: user.id, label: "Casa (prueba)", country: "ES", countryName: "España", region: "Comunidad de Madrid", city: "Madrid", latitude: 40.42, longitude: -3.7, elevationM: 657, timezone: "Europe/Madrid", isDefault: true } });
    }
    console.log(`Usuario de demostración: ${email} / demo-botanix-2026 (DATOS DE PRUEBA)`);
  }
}

main().finally(() => db.$disconnect());

// Política de conservación: borra las fotos de análisis caducadas que no se guardaron en una
// planta o en el diario. Programar a diario (cron, tarea programada del hosting…).
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "node:fs";
import path from "node:path";

const db = new PrismaClient();
const root = path.resolve(process.env.STORAGE_LOCAL_DIR ?? "./storage");

async function main() {
  const expired = await db.photo.findMany({
    where: { retainUntil: { lt: new Date() }, journal: { none: {} }, plantsCover: { none: {} } },
    select: { id: true, storageKey: true },
    take: 5000,
  });
  for (const p of expired) {
    const full = path.resolve(root, p.storageKey);
    if (full.startsWith(root + path.sep)) await fs.rm(full, { force: true });
  }
  const { count } = await db.photo.deleteMany({ where: { id: { in: expired.map((p) => p.id) } } });
  const sessions = await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  console.log(`Fotos eliminadas: ${count} · Sesiones caducadas eliminadas: ${sessions.count}`);
}

main().finally(() => db.$disconnect());

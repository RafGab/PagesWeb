import { promises as fs } from "node:fs";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";

// Política de conservación: borra las fotos de análisis caducadas que no se guardaron en una
// planta o en el diario, y las sesiones expiradas. Sin "server-only" para poder usarlo desde scripts.
export async function runCleanup(db: PrismaClient, storageDir: string) {
  const root = path.resolve(storageDir);
  const expired = await db.photo.findMany({
    where: { retainUntil: { lt: new Date() }, journal: { none: {} }, plantsCover: { none: {} } },
    select: { id: true, storageKey: true },
    take: 5000,
  });
  for (const p of expired) {
    const full = path.resolve(root, p.storageKey);
    if (full.startsWith(root + path.sep)) await fs.rm(full, { force: true });
  }
  const photos = await db.photo.deleteMany({ where: { id: { in: expired.map((p) => p.id) } } });
  const sessions = await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return { photos: photos.count, sessions: sessions.count };
}

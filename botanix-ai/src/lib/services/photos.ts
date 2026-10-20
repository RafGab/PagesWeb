import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { processUpload } from "@/lib/storage/images";
import { storage } from "@/lib/storage";

/** Procesa y guarda una foto privada. `retain=false` => se purga tras IMAGE_RETENTION_DAYS si no se vincula a una planta. */
export async function savePhoto(userId: string, input: Buffer, retain = false) {
  const img = await processUpload(input, env().MAX_UPLOAD_MB * 1_048_576);
  const key = `${userId}/${randomBytes(12).toString("hex")}.jpg`;
  await storage().put(key, img.buffer);
  return db.photo.create({
    data: {
      userId,
      storageKey: key,
      mimeType: img.mimeType,
      width: img.width,
      height: img.height,
      bytes: img.bytes,
      sha256: img.sha256,
      retainUntil: retain ? null : new Date(Date.now() + env().IMAGE_RETENTION_DAYS * 86_400_000),
    },
  });
}

export async function getOwnedPhotos(userId: string, photoIds: string[]) {
  const photos = await db.photo.findMany({ where: { id: { in: photoIds }, userId } });
  if (photos.length !== new Set(photoIds).size) throw new AppError("NOT_FOUND", "Alguna foto no existe o no te pertenece.");
  return photoIds.map((id) => photos.find((p) => p.id === id)!);
}

/** Marca fotos como conservadas (p. ej., al guardar una planta o una entrada del diario). */
export async function retainPhotos(userId: string, photoIds: string[]) {
  if (!photoIds.length) return;
  await db.photo.updateMany({ where: { id: { in: photoIds }, userId }, data: { retainUntil: null } });
}

export async function deletePhotoFiles(keys: string[]) {
  await Promise.all(keys.map((k) => storage().delete(k).catch(() => undefined)));
}

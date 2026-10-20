import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";
import { storage } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

// Las fotos solo se sirven a su propietario y nunca se cachean en proxies compartidos.
export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const photo = await db.photo.findFirst({ where: { id, userId: user.id } });
  if (!photo) throw new AppError("NOT_FOUND", "Foto no encontrada.");
  const data = await storage().get(photo.storageKey);
  if (!data) throw new AppError("NOT_FOUND", "Foto no disponible.");
  return new Response(new Uint8Array(data), { headers: { "content-type": photo.mimeType, "cache-control": "private, max-age=3600", "x-content-type-options": "nosniff" } });
});

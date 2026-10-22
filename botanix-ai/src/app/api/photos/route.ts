import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { enforceRateLimit, route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";
import { env } from "@/lib/env";
import { savePhoto } from "@/lib/services/photos";

const MAX_FILES = 8;

export const POST = route(async (req) => {
  const user = await requireUser();
  enforceRateLimit(`photos:${user.id}`, 60, 60 * 60_000);
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > (env().MAX_UPLOAD_MB * MAX_FILES + 1) * 1_048_576) throw new AppError("BAD_IMAGE", "Subida demasiado grande.");
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) throw new AppError("VALIDATION", "No se ha recibido ninguna imagen.");
  if (files.length > MAX_FILES) throw new AppError("VALIDATION", `Máximo ${MAX_FILES} imágenes por subida.`);
  const retain = form.get("retain") === "1";
  const photos = [];
  for (const f of files) {
    const p = await savePhoto(user.id, Buffer.from(await f.arrayBuffer()), retain);
    photos.push({ id: p.id, width: p.width, height: p.height });
  }
  return NextResponse.json({ photos }, { status: 201 });
});

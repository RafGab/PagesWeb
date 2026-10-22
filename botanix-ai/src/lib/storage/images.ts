import "server-only";
import sharp, { type Metadata } from "sharp";
import { createHash } from "node:crypto";
import { AppError } from "@/lib/errors";

// Lado largo máximo: los modelos de visión reescalan por encima de ~1568 px, así que no aporta enviar más.
export const MAX_EDGE = 1568;
const ALLOWED = new Set(["jpeg", "png", "webp", "heif", "avif", "tiff"]);

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: "image/jpeg";
  width: number;
  height: number;
  bytes: number;
  sha256: string;
}

/**
 * Valida el contenido real del archivo (no la extensión ni el tipo declarado), corrige la
 * orientación, elimina todos los metadatos (incluida la ubicación GPS del EXIF),
 * redimensiona y recomprime a JPEG.
 */
export async function processUpload(input: Buffer, maxBytes: number): Promise<ProcessedImage> {
  if (input.byteLength === 0) throw new AppError("BAD_IMAGE", "El archivo está vacío.");
  if (input.byteLength > maxBytes) throw new AppError("BAD_IMAGE", `La imagen supera el tamaño máximo de ${Math.round(maxBytes / 1_048_576)} MB.`);
  let meta: Metadata;
  try {
    meta = await sharp(input, { limitInputPixels: 60_000_000 }).metadata();
  } catch {
    throw new AppError("BAD_IMAGE", "El archivo no es una imagen válida.");
  }
  if (!meta.format || !ALLOWED.has(meta.format)) throw new AppError("BAD_IMAGE", "Formato no admitido. Usa JPEG, PNG, WebP o HEIC.");
  if ((meta.width ?? 0) < 200 || (meta.height ?? 0) < 200) throw new AppError("BAD_IMAGE", "La imagen es demasiado pequeña (mínimo 200 × 200 px).");
  try {
    const { data, info } = await sharp(input, { limitInputPixels: 60_000_000 })
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    return {
      buffer: data,
      mimeType: "image/jpeg",
      width: info.width,
      height: info.height,
      bytes: data.byteLength,
      sha256: createHash("sha256").update(data).digest("hex"),
    };
  } catch {
    throw new AppError("BAD_IMAGE", "No se pudo procesar la imagen.");
  }
}

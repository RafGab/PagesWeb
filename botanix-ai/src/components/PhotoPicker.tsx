"use client";
import { useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { Notice } from "./ui";

type Item = { key: string; preview: string; id?: string; error?: string };

/** Reduce la foto en el navegador antes de subirla (menos datos móviles); el servidor la valida igualmente. */
async function downscale(file: File, maxEdge = 2048): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 3_000_000 && file.type === "image/jpeg") return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/jpeg", 0.9));
  } catch {
    return file;
  }
}

export function PhotoPicker({ max = 3, retain = false, onChange }: { max?: number; retain?: boolean; onChange: (ids: string[]) => void }) {
  const { t } = useI18n();
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const emit = (xs: Item[]) => onChange(xs.filter((x) => x.id).map((x) => x.id!));

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = max - items.length;
    const list = Array.from(files).slice(0, room);
    const pending: Item[] = list.map((f) => ({ key: `${f.name}-${f.size}-${Math.random()}`, preview: URL.createObjectURL(f) }));
    let next = [...items, ...pending];
    setItems(next);
    setBusy(true);
    for (let i = 0; i < list.length; i++) {
      const fd = new FormData();
      fd.append("files", await downscale(list[i]), "photo.jpg");
      if (retain) fd.append("retain", "1");
      try {
        const r = await api<{ photos: { id: string }[] }>("/api/photos", { method: "POST", body: fd });
        next = next.map((x) => (x.key === pending[i].key ? { ...x, id: r.photos[0].id } : x));
      } catch (err) {
        const msg = err instanceof ApiError ? (err.code === "NETWORK" ? t.errors.network : err.message) : t.common.error;
        next = next.map((x) => (x.key === pending[i].key ? { ...x, error: msg } : x));
      }
      setItems(next);
    }
    setBusy(false);
    emit(next);
  }

  function remove(key: string) {
    const next = items.filter((x) => x.key !== key);
    setItems(next);
    emit(next);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="btn btn-primary min-h-24 flex-col !rounded-2xl text-base" onClick={() => cameraRef.current?.click()} disabled={items.length >= max || busy}>
          <Camera className="h-7 w-7" aria-hidden /> {t.photo.take}
        </button>
        <button type="button" className="btn btn-ghost min-h-24 flex-col !rounded-2xl text-base" onClick={() => galleryRef.current?.click()} disabled={items.length >= max || busy}>
          <ImagePlus className="h-7 w-7" aria-hidden /> {t.photo.choose}
        </button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      <p className="muted text-sm">{t.photo.tips}</p>
      {items.length > 0 && (
        <ul className="grid grid-cols-3 gap-2" aria-live="polite">
          {items.map((x) => (
            <li key={x.key} className="relative overflow-hidden rounded-2xl border border-[var(--line)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.preview} alt="" className={`aspect-square w-full object-cover ${!x.id && !x.error ? "opacity-50" : ""}`} />
              {!x.id && !x.error && <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-xs text-white">{t.photo.uploading}</span>}
              {x.error && <span className="absolute inset-x-0 bottom-0 bg-[var(--color-berry-600)] p-1 text-center text-[11px] text-white">{x.error}</span>}
              <button type="button" onClick={() => remove(x.key)} className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1.5 text-white" aria-label={t.photo.remove}>
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {items.length >= max && <Notice>{t.photo.max} ({max})</Notice>}
    </div>
  );
}

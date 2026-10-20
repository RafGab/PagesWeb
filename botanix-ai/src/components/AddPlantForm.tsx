"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { Notice } from "./ui";

export function AddPlantForm() {
  const { t } = useI18n();
  const p = t.plants;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!open) return <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" aria-hidden /> {p.add}</button>;
  return (
    <form className="card grid w-full gap-3 p-5 sm:grid-cols-2" onSubmit={async (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      try {
        const r = await api<{ plant: { id: string } }>("/api/plants", { method: "POST", json: {
          nickname: f.get("nickname"), scientificName: (f.get("scientificName") as string) || null, commonName: (f.get("commonName") as string) || null,
          locationNote: (f.get("locationNote") as string) || null, potted: f.get("potted") === "on", sownAt: (f.get("sownAt") as string) || null,
        } });
        router.push(`/plants/${r.plant.id}`);
      } catch (err) { setError(err instanceof ApiError ? err.message : t.common.error); }
    }}>
      <div><label className="label" htmlFor="nickname">{p.nickname}</label><input id="nickname" name="nickname" className="input" required maxLength={80} /></div>
      <div><label className="label" htmlFor="commonName">{p.common}</label><input id="commonName" name="commonName" className="input" maxLength={120} /></div>
      <div><label className="label" htmlFor="scientificName">{p.scientific}</label><input id="scientificName" name="scientificName" className="input italic" maxLength={120} /></div>
      <div><label className="label" htmlFor="locationNote">{p.locationNote}</label><input id="locationNote" name="locationNote" className="input" maxLength={200} /></div>
      <div><label className="label" htmlFor="sownAt">{t.plants.careTypes.SOWING} ({t.common.optional})</label><input id="sownAt" name="sownAt" type="date" className="input" /></div>
      <label className="flex items-center gap-2 self-end pb-3"><input type="checkbox" name="potted" defaultChecked className="h-4 w-4" /> {p.potted}</label>
      {error && <div className="sm:col-span-2"><Notice tone="danger">{error}</Notice></div>}
      <div className="flex gap-2 sm:col-span-2"><button className="btn btn-primary">{t.common.save}</button><button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>{t.common.cancel}</button></div>
    </form>
  );
}

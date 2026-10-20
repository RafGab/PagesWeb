"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { PhotoPicker } from "./PhotoPicker";
import { LocationSelect, type LocationOption } from "./LocationSelect";
import { Notice } from "./ui";
import { NotConfigured } from "./NotConfigured";

type Props = { kind: "IDENTIFY" | "DIAGNOSE"; locations: LocationOption[]; plants: { id: string; nickname: string }[]; maxPhotos: number; hasConsent: boolean; aiConfigured: boolean; aiHelp?: string[] };

export function AnalysisForm({ kind, locations, plants, maxPhotos, hasConsent, aiConfigured, aiHelp }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [locationId, setLocationId] = useState<string | null>(locations[0]?.id ?? null);
  const [error, setError] = useState<{ message: string; help?: string[]; code?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const d = t.diagnose;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const ctx: Record<string, string> = {};
    for (const k of ["setting", "species", "notes", "watering", "substrate", "light", "temperature", "evolution", "recentChanges"]) {
      const v = f.get(k);
      if (typeof v === "string" && v.trim()) ctx[k] = v.trim();
    }
    const userPlantId = (f.get("userPlantId") as string) || undefined;
    try {
      const r = await api<{ id: string }>("/api/analyses", { method: "POST", json: { kind, photoIds, locationId, userPlantId, context: ctx } });
      router.push(`/analyses/${r.id}`);
    } catch (err) {
      if (err instanceof ApiError) setError({ message: err.code === "NETWORK" ? t.errors.network : err.message, help: (err.details as { help?: string[] })?.help, code: err.code });
      else setError({ message: t.common.error });
      setBusy(false);
    }
  }

  if (!aiConfigured) return <NotConfigured message={t.errors.AI_NOT_CONFIGURED} help={aiHelp} />;
  if (!hasConsent)
    return (
      <Notice tone="warn">
        {t.auth.imageConsent}. <a href="/profile#privacy" className="font-semibold underline">{t.nav.profile}</a>
      </Notice>
    );

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="card space-y-4 p-5">
        <PhotoPicker max={maxPhotos} onChange={setPhotoIds} />
      </div>
      <div className="card space-y-4 p-5">
        <fieldset>
          <legend className="label">{kind === "IDENTIFY" ? t.identify.where : d.environment}</legend>
          <div className="flex flex-wrap gap-2">
            {(["outdoor", "indoor", "greenhouse"] as const).map((s, i) => (
              <label key={s} className="chip cursor-pointer has-[:checked]:bg-[var(--color-sage-100)] has-[:checked]:border-[var(--color-forest-600)] has-[:checked]:text-[var(--color-forest-800)] !py-2 !px-3 text-sm">
                <input type="radio" name="setting" value={s} defaultChecked={i === 0} className="sr-only" />
                {s === "indoor" ? t.identify.indoor : s === "outdoor" ? t.identify.outdoor : t.identify.greenhouse}
              </label>
            ))}
          </div>
        </fieldset>
        <LocationSelect locations={locations} value={locationId} onChange={setLocationId} />
        {kind === "IDENTIFY" ? (
          <div>
            <label className="label" htmlFor="notes">{t.identify.notes}</label>
            <textarea id="notes" name="notes" className="textarea" rows={3} maxLength={500} />
          </div>
        ) : (
          <>
            {plants.length > 0 && (
              <div>
                <label className="label" htmlFor="userPlantId">{t.plants.title} ({t.common.optional})</label>
                <select id="userPlantId" name="userPlantId" className="select" defaultValue="">
                  <option value="">—</option>
                  {plants.map((p) => <option key={p.id} value={p.id}>{p.nickname}</option>)}
                </select>
              </div>
            )}
            {(
              [
                ["species", d.species],
                ["watering", d.watering],
                ["substrate", d.substrate],
                ["light", d.light],
                ["temperature", d.temperature],
                ["evolution", d.evolution],
                ["recentChanges", d.recentChanges],
              ] as const
            ).map(([name, label]) => (
              <div key={name}>
                <label className="label" htmlFor={name}>{label} <span className="muted font-normal">({t.common.optional})</span></label>
                <input id={name} name={name} className="input" maxLength={500} />
              </div>
            ))}
            <Notice>{d.disclaimer}</Notice>
          </>
        )}
        {error && (error.code === "AI_NOT_CONFIGURED" ? <NotConfigured message={error.message} help={error.help} /> : <Notice tone="danger">{error.message}</Notice>)}
        <button type="submit" className="btn btn-primary w-full" disabled={busy || photoIds.length === 0}>
          {busy ? t.common.loading : kind === "IDENTIFY" ? t.identify.run : d.run}
        </button>
      </div>
    </form>
  );
}

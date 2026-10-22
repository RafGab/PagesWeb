"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, BookImage, Droplets, Trash2, Check } from "lucide-react";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { PhotoPicker } from "./PhotoPicker";
import { Notice } from "./ui";

type Plant = {
  id: string; nickname: string; scientificName: string | null; commonName: string | null; status: string; locationNote: string | null; potted: boolean; notes: string | null;
  sownAt: string | null; germinatedAt: string | null;
  careEvents: { id: string; type: string; date: string; quantity: string | null; notes: string | null }[];
  journal: { id: string; date: string; title: string | null; notes: string | null; heightCm: number | null; healthScore: number | null; photos: { photoId: string }[] }[];
  reminders: { id: string; title: string; type: string; intervalDays: number; nextDueAt: string; enabled: boolean; seasonAdaptive: boolean }[];
  diagnoses: { id: string; primaryProblem: string; severity: string; analysis: { id: string; createdAt: string } }[];
};
const CARE = ["WATERING", "FERTILIZING", "PRUNING", "TRANSPLANT", "SOWING", "GERMINATION", "HARVEST", "TREATMENT", "PEST_PREVENTION", "OTHER"] as const;

export function PlantDetail({ plant }: { plant: Plant }) {
  const { t, locale } = useI18n();
  const p = t.plants;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [journalPhotos, setJournalPhotos] = useState<string[]>([]);
  const [pickerKey, setPickerKey] = useState(0);
  const [compare, setCompare] = useState<[string | null, string | null]>([null, null]);
  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const fail = (e: unknown) => setError(e instanceof ApiError ? (e.code === "NETWORK" ? t.errors.network : e.message) : t.common.error);
  const allPhotos = plant.journal.flatMap((j) => j.photos.map((ph) => ({ id: ph.photoId, date: j.date }))).reverse();

  return (
    <div className="space-y-6">
      {error && <Notice tone="danger">{error}</Notice>}
      <section className="card grid gap-3 p-5 sm:grid-cols-3">
        <div><label className="label" htmlFor="status">{p.status}</label>
          <select id="status" className="select" defaultValue={plant.status} onChange={async (e) => { await api(`/api/plants/${plant.id}`, { method: "PATCH", json: { status: e.target.value } }).catch(fail); router.refresh(); }}>
            {Object.entries(p.statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="text-sm sm:col-span-2">
          {plant.locationNote && <p>📍 {plant.locationNote} {plant.potted ? `· ${p.potted}` : ""}</p>}
          {plant.sownAt && <p>{p.careTypes.SOWING}: {fmt.format(new Date(plant.sownAt))}</p>}
          {plant.germinatedAt && <p>{p.careTypes.GERMINATION}: {fmt.format(new Date(plant.germinatedAt))}</p>}
          <p className="mt-2 flex flex-wrap gap-2">
            <Link href={`/diagnose`} className="btn btn-ghost !py-1.5 text-sm">{t.nav.diagnose}</Link>
            <button type="button" className="btn btn-ghost !py-1.5 text-sm text-[var(--color-berry-600)]" onClick={async () => { if (confirm(t.common.confirmDelete)) { await api(`/api/plants/${plant.id}`, { method: "DELETE" }).catch(fail); router.push("/plants"); router.refresh(); } }}><Trash2 className="h-4 w-4" aria-hidden /> {t.common.delete}</button>
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2"><Droplets className="h-5 w-5" aria-hidden /> {p.care}</h2>
          <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try { await api(`/api/plants/${plant.id}/events`, { method: "POST", json: { type: f.get("type"), date: f.get("date") || undefined, quantity: (f.get("quantity") as string) || null, notes: (f.get("notes") as string) || null } }); (e.target as HTMLFormElement).reset(); router.refresh(); } catch (err) { fail(err); }
          }}>
            <label className="sr-only" htmlFor="ev-type">{p.addEvent}</label>
            <select id="ev-type" name="type" className="select">{CARE.map((c) => <option key={c} value={c}>{p.careTypes[c]}</option>)}</select>
            <input name="date" type="date" className="input" aria-label="Fecha" defaultValue={new Date().toISOString().slice(0, 10)} />
            <button className="btn btn-primary">{t.common.add}</button>
            <input name="quantity" className="input sm:col-span-1" placeholder="2 L, 300 g…" maxLength={80} aria-label="Cantidad" />
            <input name="notes" className="input sm:col-span-2" placeholder={p.notes} maxLength={1000} aria-label={p.notes} />
          </form>
          {plant.careEvents.length ? (
            <ol className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {plant.careEvents.map((e) => (
                <li key={e.id} className="flex justify-between gap-2 rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm">
                  <span><b>{p.careTypes[e.type as (typeof CARE)[number]]}</b>{e.quantity ? ` · ${e.quantity}` : ""}{e.notes ? <span className="muted"> — {e.notes}</span> : null}</span>
                  <span className="muted shrink-0">{fmt.format(new Date(e.date))}</span>
                </li>
              ))}
            </ol>
          ) : <p className="muted text-sm">{t.common.empty}</p>}
        </section>

        <section className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2"><Bell className="h-5 w-5" aria-hidden /> {p.reminders}</h2>
          <form className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_6rem_auto]" onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const type = f.get("type") as string;
            try { await api("/api/reminders", { method: "POST", json: { type, title: (f.get("title") as string) || p.careTypes[type as (typeof CARE)[number]], intervalDays: Number(f.get("interval")), userPlantId: plant.id, seasonAdaptive: true } }); (e.target as HTMLFormElement).reset(); router.refresh(); } catch (err) { fail(err); }
          }}>
            <select name="type" className="select" aria-label="Tipo">{CARE.map((c) => <option key={c} value={c}>{p.careTypes[c]}</option>)}</select>
            <input name="title" className="input" placeholder={t.reminders.add} maxLength={120} aria-label={t.reminders.add} />
            <input name="interval" type="number" min={1} max={730} defaultValue={7} className="input" aria-label={`${t.reminders.every} (${t.reminders.days})`} />
            <button className="btn btn-primary">{t.common.add}</button>
          </form>
          {plant.reminders.length ? (
            <ul className="space-y-2">
              {plant.reminders.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm">
                  <span><b>{r.title}</b> · {t.reminders.every} {r.intervalDays} {t.reminders.days}{r.seasonAdaptive ? " · 🌡" : ""}<br /><span className={new Date(r.nextDueAt) < new Date() ? "text-[var(--color-berry-600)]" : "muted"}>{t.reminders.next}: {fmt.format(new Date(r.nextDueAt))}</span></span>
                  <button type="button" className="btn btn-ghost !p-2" aria-label={t.reminders.markDone} onClick={async () => { await api(`/api/reminders/${r.id}/done`, { method: "POST" }).catch(fail); router.refresh(); }}><Check className="h-4 w-4" aria-hidden /></button>
                </li>
              ))}
            </ul>
          ) : <p className="muted text-sm">{t.reminders.none}</p>}
        </section>
      </div>

      <section className="card p-5">
        <h2 className="section-title mb-3 flex items-center gap-2"><BookImage className="h-5 w-5" aria-hidden /> {p.journal}</h2>
        <form className="mb-5 grid gap-3 lg:grid-cols-2" onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            await api(`/api/plants/${plant.id}/journal`, { method: "POST", json: { title: (f.get("title") as string) || null, notes: (f.get("notes") as string) || null, heightCm: f.get("heightCm") ? Number(f.get("heightCm")) : null, healthScore: f.get("healthScore") ? Number(f.get("healthScore")) : null, photoIds: journalPhotos } });
            (e.target as HTMLFormElement).reset(); setJournalPhotos([]); setPickerKey((k) => k + 1); router.refresh();
          } catch (err) { fail(err); }
        }}>
          <PhotoPicker key={pickerKey} max={4} retain onChange={setJournalPhotos} />
          <div className="space-y-2">
            <input name="title" className="input" placeholder={p.addEntry} maxLength={120} aria-label={p.addEntry} />
            <textarea name="notes" className="textarea" rows={3} placeholder={p.notes} maxLength={3000} aria-label={p.notes} />
            <div className="grid grid-cols-2 gap-2">
              <input name="heightCm" type="number" step="0.1" min={0} className="input" placeholder={p.height} aria-label={p.height} />
              <select name="healthScore" className="select" aria-label={p.health} defaultValue=""><option value="">{p.health}</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}</select>
            </div>
            <button className="btn btn-primary w-full">{t.common.save}</button>
          </div>
        </form>

        {allPhotos.length >= 2 && (
          <div className="mb-5 rounded-2xl border border-[var(--line)] p-4">
            <p className="mb-2 font-semibold">{p.compare}</p>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((side) => {
                const sel = compare[side] ?? (side === 0 ? allPhotos[0].id : allPhotos[allPhotos.length - 1].id);
                const entry = allPhotos.find((x) => x.id === sel);
                return (
                  <div key={side}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/photos/${sel}`} alt="" className="aspect-square w-full rounded-xl object-cover" />
                    <select className="select mt-2 text-sm" value={sel} aria-label={p.compare} onChange={(e) => setCompare((c) => (side === 0 ? [e.target.value, c[1]] : [c[0], e.target.value]))}>
                      {allPhotos.map((x) => <option key={x.id} value={x.id}>{fmt.format(new Date(x.date))}</option>)}
                    </select>
                    {entry && <p className="muted mt-1 text-xs">{fmt.format(new Date(entry.date))}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {plant.journal.length ? (
          <ol className="space-y-4">
            {plant.journal.map((j) => (
              <li key={j.id} className="border-l-2 border-[var(--color-sage-300)] pl-4">
                <p className="muted text-xs">{fmt.format(new Date(j.date))}</p>
                {j.title && <p className="font-semibold">{j.title}</p>}
                {j.notes && <p className="text-sm">{j.notes}</p>}
                <p className="muted text-xs">{j.heightCm != null ? `${j.heightCm} cm` : ""}{j.healthScore ? ` · ${"★".repeat(j.healthScore)}` : ""}</p>
                {j.photos.length > 0 && <div className="mt-2 flex gap-2 overflow-x-auto">{j.photos.map((ph) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={ph.photoId} src={`/api/photos/${ph.photoId}`} alt="" className="h-24 w-24 rounded-xl object-cover" />
                ))}</div>}
              </li>
            ))}
          </ol>
        ) : <p className="muted text-sm">{t.common.empty}</p>}
      </section>

      {plant.diagnoses.length > 0 && (
        <section className="card p-5">
          <h2 className="section-title mb-3">{p.diagnoses}</h2>
          <ul className="space-y-2">{plant.diagnoses.map((d) => <li key={d.id}><Link className="underline" href={`/analyses/${d.analysis.id}`}>{d.primaryProblem}</Link> <span className="muted text-sm">· {fmt.format(new Date(d.analysis.createdAt))}</span></li>)}</ul>
        </section>
      )}
    </div>
  );
}

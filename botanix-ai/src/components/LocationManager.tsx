"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Star, Trash2 } from "lucide-react";
import type { Place } from "@/lib/climate/types";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { Notice } from "./ui";

type Loc = { id: string; label: string; city: string | null; region: string | null; countryName: string; isDefault: boolean; elevationM: number | null; notes: string | null };

export function LocationManager({ locations }: { locations: Loc[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const p = t.profile;
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Place[] | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fail = (e: unknown) => setError(e instanceof ApiError ? (e.code === "NETWORK" ? t.errors.network : e.message) : t.common.error);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await api<{ places: Place[] }>(`/api/places?q=${encodeURIComponent(q)}&lang=${locale}`);
      setResults(r.places);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await api("/api/locations", {
        method: "POST",
        json: {
          label: label || selected.name, country: selected.countryCode, countryName: selected.countryName, region: selected.region, city: selected.name,
          postalCode: selected.postcodes[0] ?? null, latitude: selected.latitude, longitude: selected.longitude, elevationM: selected.elevationM, timezone: selected.timezone, notes: notes || null,
        },
      });
      setSelected(null); setResults(null); setQ(""); setLabel(""); setNotes("");
      router.refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {locations.length > 0 && (
        <ul className="divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)]">
          {locations.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-2 p-3">
              <div>
                <p className="font-semibold">{l.label} {l.isDefault && <span className="chip chip-green ml-1">{p.default}</span>}</p>
                <p className="muted text-sm">{[l.city, l.region, l.countryName].filter(Boolean).join(", ")}{l.elevationM != null ? ` · ${Math.round(l.elevationM)} m` : ""}</p>
                {l.notes && <p className="muted text-xs">{l.notes}</p>}
              </div>
              <div className="flex gap-1">
                {!l.isDefault && (
                  <button type="button" className="btn btn-ghost !p-2" aria-label={p.default} onClick={async () => { await api(`/api/locations/${l.id}`, { method: "PATCH", json: { isDefault: true } }).catch(fail); router.refresh(); }}>
                    <Star className="h-4 w-4" aria-hidden />
                  </button>
                )}
                <button type="button" className="btn btn-ghost !p-2" aria-label={t.common.delete} onClick={async () => { if (confirm(t.common.confirmDelete)) { await api(`/api/locations/${l.id}`, { method: "DELETE" }).catch(fail); router.refresh(); } }}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={search} className="flex gap-2">
        <label className="sr-only" htmlFor="place-q">{p.searchPlace}</label>
        <input id="place-q" className="input" placeholder={p.searchPlace} value={q} onChange={(e) => setQ(e.target.value)} minLength={2} required />
        <button className="btn btn-primary" disabled={busy}><Search className="h-4 w-4" aria-hidden /><span className="sr-only sm:not-sr-only">{t.common.search}</span></button>
      </form>
      <p className="muted text-xs">{p.placeHint}</p>
      {results && !selected && (
        results.length ? (
          <ul className="space-y-1">
            {results.map((r, i) => (
              <li key={i}>
                <button type="button" className="flex w-full items-center gap-2 rounded-xl p-2.5 text-left hover:bg-[var(--surface-2)]" onClick={() => { setSelected(r); setLabel(r.name); }}>
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  <span><span className="font-semibold">{r.name}</span> <span className="muted text-sm">{[r.subregion, r.region, r.countryName].filter(Boolean).join(", ")}{r.elevationM != null ? ` · ${Math.round(r.elevationM)} m` : ""}</span></span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="muted text-sm">{t.common.empty}</p>
      )}
      {selected && (
        <div className="space-y-3 rounded-2xl border border-[var(--line)] p-4">
          <p className="font-semibold">{selected.name}, {selected.countryName}</p>
          <div><label className="label" htmlFor="loc-label">{p.label}</label><input id="loc-label" className="input" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} /></div>
          <div><label className="label" htmlFor="loc-notes">{p.microclimate}</label><input id="loc-notes" className="input" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} /></div>
          <div className="flex gap-2"><button type="button" className="btn btn-primary" onClick={save} disabled={busy}>{t.common.save}</button><button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>{t.common.cancel}</button></div>
        </div>
      )}
      {error && <Notice tone="danger">{error}</Notice>}
    </div>
  );
}

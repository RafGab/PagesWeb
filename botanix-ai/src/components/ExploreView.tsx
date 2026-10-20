"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { Notice, Spinner } from "./ui";

type Res = {
  crops: { slug: string; name: string; scientificName: string; category: string }[];
  taxa: { id: string; scientificName: string; family: string | null; commonNames: { name: string }[]; profiles: { id: string }[] }[];
  gbif: { key: number; scientificName: string; family?: string; vernacularNames?: { vernacularName: string; language?: string }[] }[] | null;
  gbifAvailable: boolean;
};

export function ExploreView() {
  const { t, locale } = useI18n();
  const e = t.explore;
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Res | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lang3 = locale === "es" ? "spa" : "eng";
  return (
    <div className="space-y-5">
      <form className="flex gap-2" role="search" onSubmit={async (ev) => {
        ev.preventDefault();
        setBusy(true);
        setError(null);
        try { setRes(await api<Res>(`/api/search?q=${encodeURIComponent(q)}`)); } catch (err) { setError(err instanceof ApiError ? err.message : t.common.error); } finally { setBusy(false); }
      }}>
        <label htmlFor="q" className="sr-only">{t.common.search}</label>
        <input id="q" className="input" value={q} onChange={(ev) => setQ(ev.target.value)} placeholder={e.placeholder} minLength={2} required />
        <button className="btn btn-primary" disabled={busy}><Search className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">{t.common.search}</span></button>
      </form>
      {busy && <Spinner label={t.common.loading} />}
      {error && <Notice tone="danger">{error}</Notice>}
      {res && (
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="card p-5">
            <h2 className="mb-3 font-semibold">{e.crops} ({res.crops.length})</h2>
            {res.crops.length ? <ul className="space-y-2">{res.crops.map((c) => <li key={c.slug}><b>{c.name}</b> <i className="muted text-sm">{c.scientificName}</i></li>)}</ul> : <p className="muted text-sm">{t.common.empty}</p>}
          </section>
          <section className="card p-5">
            <h2 className="mb-3 font-semibold">{e.local} ({res.taxa.length})</h2>
            {res.taxa.length ? <ul className="space-y-2">{res.taxa.map((x) => <li key={x.id}><i className="font-semibold">{x.scientificName}</i> <span className="muted text-sm">{x.family ?? ""}{x.commonNames[0] ? ` · ${x.commonNames[0].name}` : ""}</span></li>)}</ul> : <p className="muted text-sm">{t.common.empty}</p>}
          </section>
          <section className="card p-5">
            <h2 className="mb-3 font-semibold">{e.gbif}</h2>
            {!res.gbifAvailable ? <p className="muted text-sm">{e.gbifUnavailable}</p> : res.gbif!.length ? (
              <ul className="space-y-2">{res.gbif!.map((g) => (
                <li key={g.key}><a href={`https://www.gbif.org/species/${g.key}`} target="_blank" rel="noopener noreferrer" className="italic underline">{g.scientificName}</a> <span className="muted text-sm">{g.family ?? ""}{(() => { const v = g.vernacularNames?.find((n) => n.language === lang3); return v ? ` · ${v.vernacularName}` : ""; })()}</span></li>
              ))}</ul>
            ) : <p className="muted text-sm">{t.common.empty}</p>}
          </section>
        </div>
      )}
    </div>
  );
}

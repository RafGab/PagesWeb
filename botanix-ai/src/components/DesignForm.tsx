"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GARDEN_STYLES } from "@/lib/domain/garden-styles";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { PhotoPicker } from "./PhotoPicker";
import { LocationSelect, type LocationOption } from "./LocationSelect";
import { Notice } from "./ui";
import { NotConfigured } from "./NotConfigured";

export function DesignForm({ locations, aiConfigured, aiHelp, hasConsent }: { locations: LocationOption[]; aiConfigured: boolean; aiHelp?: string[]; hasConsent: boolean }) {
  const { t, locale } = useI18n();
  const d = t.design;
  const router = useRouter();
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [locationId, setLocationId] = useState<string | null>(locations[0]?.id ?? null);
  const [error, setError] = useState<{ message: string; help?: string[]; code?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  if (!aiConfigured) return <NotConfigured message={t.errors.AI_NOT_CONFIGURED} help={aiHelp} />;

  return (
    <form className="grid gap-6 lg:grid-cols-[1fr_1.2fr]" onSubmit={async (e) => {
      e.preventDefault();
      setBusy(true);
      setError(null);
      const f = new FormData(e.currentTarget);
      const num = (k: string) => (f.get(k) ? Number(f.get(k)) : null);
      try {
        const r = await api<{ designId: string }>("/api/designs", { method: "POST", json: {
          title: f.get("title"), style: f.get("style"), photoIds, locationId,
          inputs: { widthM: num("widthM"), depthM: num("depthM"), orientation: f.get("orientation"), budgetMax: num("budgetMax"), currency: f.get("currency"), maintenance: f.get("maintenance"), uses: f.get("uses") || undefined, keep: f.get("keep") || undefined, soil: f.get("soil") || undefined, spaceType: f.get("spaceType") },
        } });
        router.push(`/design/${r.designId}`);
      } catch (err) {
        setError(err instanceof ApiError ? { message: err.code === "NETWORK" ? t.errors.network : err.message, help: (err.details as { help?: string[] })?.help, code: err.code } : { message: t.common.error });
        setBusy(false);
      }
    }}>
      <div className="card space-y-3 p-5">
        {hasConsent ? <PhotoPicker max={6} onChange={setPhotoIds} /> : <Notice tone="warn">{t.auth.imageConsent}</Notice>}
      </div>
      <div className="card grid gap-3 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label" htmlFor="title">{locale === "es" ? "Nombre del proyecto" : "Project name"}</label><input id="title" name="title" className="input" required maxLength={100} defaultValue={locale === "es" ? "Mi jardín" : "My garden"} /></div>
        <div><label className="label" htmlFor="spaceType">{locale === "es" ? "Tipo de espacio" : "Space type"}</label>
          <select id="spaceType" name="spaceType" className="select" defaultValue="garden">
            {(locale === "es" ? [["patio", "Patio"], ["garden", "Jardín"], ["terrace", "Terraza"], ["balcony", "Balcón"], ["plot", "Parcela"], ["rural", "Terreno rural"], ["lawn", "Zona de césped"], ["other", "Otro"]] : [["patio", "Patio"], ["garden", "Garden"], ["terrace", "Terrace"], ["balcony", "Balcony"], ["plot", "Plot"], ["rural", "Rural land"], ["lawn", "Lawn area"], ["other", "Other"]]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div><label className="label" htmlFor="style">{d.style}</label>
          <select id="style" name="style" className="select" defaultValue="recommend">{GARDEN_STYLES.map((s) => <option key={s} value={s}>{d.styles[s]}</option>)}</select>
        </div>
        <div><label className="label" htmlFor="widthM">{d.width}</label><input id="widthM" name="widthM" type="number" step="0.1" min={0.5} className="input" /></div>
        <div><label className="label" htmlFor="depthM">{d.depth}</label><input id="depthM" name="depthM" type="number" step="0.1" min={0.5} className="input" /></div>
        <div><label className="label" htmlFor="orientation">{d.orientation}</label>
          <select id="orientation" name="orientation" className="select" defaultValue="unknown">{["unknown", "N", "NE", "E", "SE", "S", "SW", "W", "NW"].map((o) => <option key={o} value={o}>{o === "unknown" ? "—" : o}</option>)}</select>
        </div>
        <div><label className="label" htmlFor="maintenance">{d.maintenance}</label>
          <select id="maintenance" name="maintenance" className="select" defaultValue="moderate"><option value="minimal">{locale === "es" ? "Mínimo" : "Minimal"}</option><option value="moderate">{locale === "es" ? "Moderado" : "Moderate"}</option><option value="high">{locale === "es" ? "Alto" : "High"}</option></select>
        </div>
        <div><label className="label" htmlFor="budgetMax">{d.budget}</label><input id="budgetMax" name="budgetMax" type="number" min={0} step="10" className="input" /></div>
        <div><label className="label" htmlFor="currency">{d.currency}</label><input id="currency" name="currency" className="input uppercase" defaultValue="EUR" maxLength={3} minLength={3} /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="uses">{d.uses}</label><input id="uses" name="uses" className="input" maxLength={500} /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="keep">{d.keep}</label><input id="keep" name="keep" className="input" maxLength={500} /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="soil">{d.soil}</label><input id="soil" name="soil" className="input" maxLength={200} /></div>
        <div className="sm:col-span-2"><LocationSelect locations={locations} value={locationId} onChange={setLocationId} /></div>
        {error && <div className="sm:col-span-2">{error.code === "AI_NOT_CONFIGURED" ? <NotConfigured message={error.message} help={error.help} /> : <Notice tone="danger">{error.message}</Notice>}</div>}
        <button className="btn btn-primary sm:col-span-2" disabled={busy}>{busy ? t.common.loading : d.run}</button>
      </div>
    </form>
  );
}

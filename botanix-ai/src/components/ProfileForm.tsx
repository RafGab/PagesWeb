"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { Notice } from "./ui";

type U = { name: string | null; locale: string; unitSystem: string; experience: string; housingType: string | null; budgetLevel: string | null; maintenancePref: string | null; hasChildren: boolean | null; hasPets: boolean | null; imageConsentAt: string | null };

export function ProfileForm({ user }: { user: U }) {
  const { t } = useI18n();
  const p = t.profile;
  const router = useRouter();
  const [msg, setMsg] = useState<{ tone: "info" | "danger"; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const tri = (v: FormDataEntryValue | null) => (v === "yes" ? true : v === "no" ? false : null);
    try {
      await api("/api/me", {
        method: "PATCH",
        json: {
          name: (f.get("name") as string) || null, locale: f.get("locale"), unitSystem: f.get("unitSystem"), experience: f.get("experience"),
          housingType: (f.get("housingType") as string) || null, budgetLevel: f.get("budgetLevel") || null, maintenancePref: f.get("maintenancePref") || null,
          hasChildren: tri(f.get("hasChildren")), hasPets: tri(f.get("hasPets")), imageConsent: f.get("imageConsent") === "on",
        },
      });
      setMsg({ tone: "info", text: "✓" });
      router.refresh();
    } catch (err) {
      setMsg({ tone: "danger", text: err instanceof ApiError ? err.message : t.common.error });
    }
  }
  const triVal = (b: boolean | null) => (b === true ? "yes" : b === false ? "no" : "");

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div><label className="label" htmlFor="name">{t.auth.name}</label><input id="name" name="name" className="input" defaultValue={user.name ?? ""} maxLength={80} /></div>
      <div><label className="label" htmlFor="locale">{p.language}</label><select id="locale" name="locale" className="select" defaultValue={user.locale}><option value="es">Español</option><option value="en">English</option></select></div>
      <div><label className="label" htmlFor="experience">{p.experience}</label><select id="experience" name="experience" className="select" defaultValue={user.experience}>{Object.entries(p.levels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      <div><label className="label" htmlFor="unitSystem">{p.units}</label><select id="unitSystem" name="unitSystem" className="select" defaultValue={user.unitSystem}><option value="METRIC">Métrico (m, °C)</option><option value="IMPERIAL">Imperial (ft, °F)</option></select></div>
      <div><label className="label" htmlFor="housingType">{p.housing}</label><input id="housingType" name="housingType" className="input" defaultValue={user.housingType ?? ""} maxLength={80} placeholder="Piso con balcón, casa con jardín, finca…" /></div>
      <div><label className="label" htmlFor="budgetLevel">{p.budget}</label><select id="budgetLevel" name="budgetLevel" className="select" defaultValue={user.budgetLevel ?? ""}><option value="">—</option><option value="low">€</option><option value="medium">€€</option><option value="high">€€€</option></select></div>
      <div><label className="label" htmlFor="maintenancePref">{p.maintenance}</label><select id="maintenancePref" name="maintenancePref" className="select" defaultValue={user.maintenancePref ?? ""}><option value="">—</option><option value="minimal">Mínimo / Minimal</option><option value="moderate">Moderado / Moderate</option><option value="high">Alto / High</option></select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="hasChildren">{p.children}</label><select id="hasChildren" name="hasChildren" className="select" defaultValue={triVal(user.hasChildren)}><option value="">—</option><option value="yes">{t.common.yes}</option><option value="no">{t.common.no}</option></select></div>
        <div><label className="label" htmlFor="hasPets">{p.pets}</label><select id="hasPets" name="hasPets" className="select" defaultValue={triVal(user.hasPets)}><option value="">—</option><option value="yes">{t.common.yes}</option><option value="no">{t.common.no}</option></select></div>
      </div>
      <label id="privacy" className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name="imageConsent" defaultChecked={Boolean(user.imageConsentAt)} className="mt-1 h-4 w-4" /><span><span className="font-semibold">{p.consent}:</span> {t.auth.imageConsent}</span></label>
      <div className="flex items-center gap-3 sm:col-span-2"><button className="btn btn-primary">{t.common.save}</button>{msg && <Notice tone={msg.tone}>{msg.text}</Notice>}</div>
    </form>
  );
}

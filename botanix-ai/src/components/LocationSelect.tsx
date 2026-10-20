"use client";
import Link from "next/link";
import { useI18n } from "./i18n";

export type LocationOption = { id: string; label: string; city: string | null; countryName: string };

export function LocationSelect({ locations, value, onChange }: { locations: LocationOption[]; value: string | null; onChange: (v: string) => void }) {
  const { t } = useI18n();
  if (!locations.length) {
    return (
      <p className="text-sm muted">
        {t.home.noLocation} <Link href="/profile#locations" className="font-semibold text-[var(--accent)] underline">{t.home.addLocation}</Link>
      </p>
    );
  }
  return (
    <div>
      <label className="label" htmlFor="location">{t.sow.location}</label>
      <select id="location" className="select" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>{l.label} — {[l.city, l.countryName].filter(Boolean).join(", ")}</option>
        ))}
      </select>
    </div>
  );
}

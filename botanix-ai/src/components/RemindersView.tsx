"use client";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { api } from "./api";
import { useI18n } from "./i18n";

type R = { id: string; title: string; intervalDays: number; nextDueAt: string; enabled: boolean; seasonAdaptive: boolean; userPlant: { id: string; nickname: string } | null };

export function RemindersView({ reminders }: { reminders: R[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" });
  const patch = async (id: string, json: object) => { await api(`/api/reminders/${id}`, { method: "PATCH", json }); router.refresh(); };
  if (!reminders.length) return <p className="muted">{t.reminders.none}</p>;
  return (
    <ul className="divide-y divide-[var(--line)]">
      {reminders.map((r) => {
        const overdue = new Date(r.nextDueAt) < new Date();
        return (
          <li key={r.id} className={`flex flex-wrap items-center justify-between gap-3 py-3 ${r.enabled ? "" : "opacity-60"}`}>
            <div>
              <p className="font-semibold">{r.title}{r.userPlant && <span className="muted font-normal"> · {r.userPlant.nickname}</span>}</p>
              <p className="text-sm"><span className={overdue && r.enabled ? "font-semibold text-[var(--color-berry-600)]" : "muted"}>{overdue && r.enabled ? `${t.reminders.overdue} · ` : ""}{fmt.format(new Date(r.nextDueAt))}</span> <span className="muted">· {t.reminders.every} {r.intervalDays} {t.reminders.days}</span></p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-1.5"><input type="checkbox" checked={r.seasonAdaptive} onChange={(e) => patch(r.id, { seasonAdaptive: e.target.checked })} /> {t.reminders.seasonAdaptive}</label>
              <label className="flex items-center gap-1.5"><input type="checkbox" checked={r.enabled} onChange={(e) => patch(r.id, { enabled: e.target.checked })} /> {t.reminders.enabled}</label>
              <button type="button" className="btn btn-primary !py-1.5" disabled={!r.enabled} onClick={async () => { await api(`/api/reminders/${r.id}/done`, { method: "POST" }); router.refresh(); }}><Check className="h-4 w-4" aria-hidden /> {t.reminders.markDone}</button>
              <button type="button" className="btn btn-ghost !p-2" aria-label={t.common.delete} onClick={async () => { if (confirm(t.common.confirmDelete)) { await api(`/api/reminders/${r.id}`, { method: "DELETE" }); router.refresh(); } }}><Trash2 className="h-4 w-4" aria-hidden /></button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

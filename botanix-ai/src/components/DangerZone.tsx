"use client";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { useI18n } from "./i18n";

export function DangerZone() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-3">
      <a href="/api/me/export" className="btn btn-ghost"><Download className="h-4 w-4" aria-hidden /> {t.profile.exportData}</a>
      <button type="button" className="btn btn-danger" onClick={async () => {
        if (!confirm(t.profile.deleteConfirm)) return;
        const r = await fetch("/api/me", { method: "DELETE" });
        if (r.ok) { router.push("/"); router.refresh(); }
      }}>
        <Trash2 className="h-4 w-4" aria-hidden /> {t.profile.deleteAccount}
      </button>
    </div>
  );
}

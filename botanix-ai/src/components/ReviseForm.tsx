"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { Notice } from "./ui";

export function ReviseForm({ designId, versionId }: { designId: string; versionId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form className="space-y-2" onSubmit={async (e) => {
      e.preventDefault();
      setBusy(true);
      setError(null);
      const f = new FormData(e.currentTarget);
      try {
        await api(`/api/designs/${designId}/revise`, { method: "POST", json: { changeRequest: f.get("changeRequest"), fromVersionId: versionId } });
        router.refresh();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t.common.error);
      } finally {
        setBusy(false);
      }
    }}>
      <label className="label" htmlFor="changeRequest">{t.design.revise}</label>
      <textarea id="changeRequest" name="changeRequest" className="textarea" rows={3} minLength={3} maxLength={1000} required placeholder={t.design.revisePlaceholder} />
      {error && <Notice tone="danger">{error}</Notice>}
      <button className="btn btn-primary" disabled={busy}>{busy ? t.common.loading : t.design.revise}</button>
    </form>
  );
}

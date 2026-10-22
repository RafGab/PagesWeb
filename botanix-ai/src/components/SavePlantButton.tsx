"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";

export function SavePlantButton({ analysisId, scientificName, commonName, coverPhotoId }: { analysisId: string; scientificName: string; commonName: string | null; coverPhotoId: string | null }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const r = await api<{ plant: { id: string } }>("/api/plants", { method: "POST", json: { nickname: commonName ?? scientificName, scientificName, commonName, sourceAnalysisId: analysisId, coverPhotoId } });
            router.push(`/plants/${r.plant.id}`);
          } catch (e) {
            setError(e instanceof ApiError ? e.message : t.common.error);
            setBusy(false);
          }
        }}
      >
        <Leaf className="h-4 w-4" aria-hidden /> {t.identify.savePlant}
      </button>
      {error && <p className="mt-1 text-sm text-[var(--color-berry-600)]">{error}</p>}
    </div>
  );
}

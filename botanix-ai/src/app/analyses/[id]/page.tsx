import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Printer, RotateCcw } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import { notConfigured } from "@/lib/ai/providers/unconfigured";
import type { Identification } from "@/lib/domain/identification";
import type { Diagnosis } from "@/lib/domain/diagnosis";
import type { NameVerification } from "@/lib/taxonomy/gbif";
import { IdentificationView } from "@/components/IdentificationView";
import { DiagnosisView } from "@/components/DiagnosisView";
import { Poller } from "@/components/Poller";
import { Notice } from "@/components/ui";
import { NotConfigured } from "@/components/NotConfigured";
import { SavePlantButton } from "@/components/SavePlantButton";
import { PrintButton } from "@/components/PrintButton";

export const metadata = { title: "Resultado" };

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePageUser(`/analyses/${id}`);
  const { t, locale } = await getDictionary();
  const a = await db.analysis.findFirst({ where: { id, userId: user.id }, include: { photos: { orderBy: { position: "asc" } } } });
  if (!a) notFound();
  const isIdentify = a.kind === "IDENTIFY";
  const retryHref = isIdentify ? "/identify" : "/diagnose";
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" });

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="muted text-sm">{isIdentify ? t.identify.title : t.diagnose.title} · {dateFmt.format(a.createdAt)}</p>
        </div>
        {a.status === "COMPLETED" && (
          <div className="no-print flex flex-wrap gap-2">
            {isIdentify && <a href={`/api/export/plant-sheet?analysisId=${a.id}`} className="btn btn-ghost !py-2 text-sm"><Download className="h-4 w-4" aria-hidden /> {t.common.download} (.md)</a>}
            <PrintButton label={t.common.print} icon={<Printer className="h-4 w-4" aria-hidden />} />
          </div>
        )}
      </div>

      {a.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {a.photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.photoId} src={`/api/photos/${p.photoId}`} alt="" className="h-28 w-28 shrink-0 rounded-2xl object-cover sm:h-36 sm:w-36" />
          ))}
        </div>
      )}

      {a.isTestFixture && <Notice tone="test">{t.common.testData}</Notice>}

      {(a.status === "PENDING" || a.status === "PROCESSING") && <Poller analysisId={a.id} />}

      {a.status === "NOT_CONFIGURED" && <NotConfigured message={a.errorMessage ?? t.errors.AI_NOT_CONFIGURED} help={(notConfigured().details as { help: string[] }).help} />}

      {a.status === "FAILED" && (
        <div className="space-y-3">
          <Notice tone="danger">{a.errorMessage ?? t.common.error}</Notice>
          <Link href={retryHref} className="btn btn-primary"><RotateCcw className="h-4 w-4" aria-hidden /> {t.common.retry}</Link>
        </div>
      )}

      {a.status === "COMPLETED" && a.warnings.length > 0 && (
        <Notice tone="warn">
          <ul className="space-y-1">{a.warnings.map((w) => <li key={w}>• {w}</li>)}</ul>
        </Notice>
      )}

      {a.status === "COMPLETED" && isIdentify && (() => {
        const r = a.result as unknown as { identification: Identification; verification: NameVerification[] };
        const top = r.identification.candidates[0];
        return (
          <>
            <IdentificationView data={r.identification} verification={r.verification ?? []} t={t} locale={locale} />
            {top && top.confidence_level !== "low" && (
              <div className="no-print"><SavePlantButton analysisId={a.id} scientificName={top.scientific_name} commonName={top.common_names[0]?.name ?? null} coverPhotoId={a.photos[0]?.photoId ?? null} /></div>
            )}
          </>
        );
      })()}

      {a.status === "COMPLETED" && a.kind === "DIAGNOSE" && <DiagnosisView data={(a.result as unknown as { diagnosis: Diagnosis }).diagnosis} t={t} />}

      {a.status === "COMPLETED" && <p className="muted text-xs">{a.provider} · {a.promptVersion}</p>}
    </div>
  );
}

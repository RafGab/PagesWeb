import Link from "next/link";
import { History } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import { PageHeader, EmptyState } from "@/components/ui";

export const metadata = { title: "Historial" };
const STATUS_CHIP: Record<string, string> = { COMPLETED: "chip-green", FAILED: "chip-red", PENDING: "chip-amber", PROCESSING: "chip-amber", NOT_CONFIGURED: "chip-red" };

export default async function HistoryPage() {
  const user = await requirePageUser("/history");
  const { t, locale } = await getDictionary();
  const analyses = await db.analysis.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100, include: { photos: { take: 1, orderBy: { position: "asc" } } } });
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const kindLabel = { IDENTIFY: t.nav.identify, DIAGNOSE: t.nav.diagnose, GARDEN_SPACE: t.nav.design };
  return (
    <div className="fade-in">
      <PageHeader title={t.history.title} icon={<History className="h-6 w-6" aria-hidden />} />
      {analyses.length === 0 ? <EmptyState icon={<History className="h-8 w-8" aria-hidden />} title={t.common.empty} /> : (
        <ul className="card divide-y divide-[var(--line)]">
          {analyses.map((a) => {
            const r = a.result as { identification?: { candidates: { scientific_name: string }[] }; diagnosis?: { primary: { problem: string } }; designId?: string } | null;
            const label = r?.identification?.candidates[0]?.scientific_name ?? r?.diagnosis?.primary.problem ?? (a.kind === "GARDEN_SPACE" ? t.nav.design : "—");
            const href = a.kind === "GARDEN_SPACE" ? `/design/${(a.context as { designId?: string })?.designId ?? ""}` : `/analyses/${a.id}`;
            return (
              <li key={a.id}>
                <Link href={href} className="flex items-center gap-3 p-3 hover:bg-[var(--surface-2)]">
                  {a.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/photos/${a.photos[0].photoId}`} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  ) : <div className="h-14 w-14 rounded-xl bg-[var(--surface-2)]" />}
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-semibold ${r?.identification ? "italic" : ""}`}>{label}</p>
                    <p className="muted text-sm">{kindLabel[a.kind]} · {fmt.format(a.createdAt)}{a.isTestFixture ? " · TEST" : ""}</p>
                  </div>
                  <span className={`chip ${STATUS_CHIP[a.status]}`}>{a.status.toLowerCase()}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

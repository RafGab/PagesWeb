import Link from "next/link";
import { Leaf } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import { PageHeader, EmptyState } from "@/components/ui";
import { AddPlantForm } from "@/components/AddPlantForm";

export const metadata = { title: "Mis plantas" };
const STATUS_CHIP: Record<string, string> = { healthy: "chip-green", watch: "chip-amber", sick: "chip-red", recovering: "chip-amber", dormant: "", dead: "", harvested: "chip-clay" };

export default async function PlantsPage() {
  const user = await requirePageUser("/plants");
  const { t, locale } = await getDictionary();
  const plants = await db.userPlant.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { reminders: { where: { enabled: true }, orderBy: { nextDueAt: "asc" }, take: 1 } },
  });
  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
  return (
    <div className="fade-in">
      <PageHeader title={t.plants.title} icon={<Leaf className="h-6 w-6" aria-hidden />} actions={<AddPlantForm />} />
      {plants.length === 0 ? (
        <EmptyState icon={<Leaf className="h-8 w-8" aria-hidden />} title={t.common.empty}>
          <Link href="/identify" className="btn btn-primary">{t.home.actions.identify[0]}</Link>
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plants.map((p) => (
            <li key={p.id}>
              <Link href={`/plants/${p.id}`} className="card block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
                {p.coverPhotoId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/photos/${p.coverPhotoId}`} alt="" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[var(--color-sage-200)] to-[var(--color-cream-200)]"><Leaf className="h-12 w-12 text-[var(--color-forest-600)]" aria-hidden /></div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{p.nickname}</p>
                    <span className={`chip ${STATUS_CHIP[p.status] ?? ""}`}>{t.plants.statuses[p.status as keyof typeof t.plants.statuses] ?? p.status}</span>
                  </div>
                  {p.scientificName && <p className="muted text-sm italic">{p.scientificName}</p>}
                  {p.reminders[0] && <p className="mt-2 text-sm">{p.reminders[0].title}: <b>{fmt.format(p.reminders[0].nextDueAt)}</b></p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

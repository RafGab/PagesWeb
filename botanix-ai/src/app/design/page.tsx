import Link from "next/link";
import { Shovel } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import { analysisFormData } from "@/lib/services/page-data";
import { PageHeader } from "@/components/ui";
import { DesignForm } from "@/components/DesignForm";

export const metadata = { title: "Diseña mi jardín" };

export default async function DesignPage() {
  const user = await requirePageUser("/design");
  const { t, locale } = await getDictionary();
  const data = await analysisFormData(user);
  const designs = await db.gardenDesign.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, include: { _count: { select: { versions: true } } } });
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  return (
    <div className="fade-in space-y-8">
      <PageHeader title={t.design.title} intro={t.design.intro} icon={<Shovel className="h-6 w-6" aria-hidden />} />
      <DesignForm locations={data.locations} aiConfigured={data.aiConfigured} aiHelp={data.aiHelp} hasConsent={data.hasConsent} />
      {designs.length > 0 && (
        <section>
          <h2 className="section-title mb-3">{t.design.proposals}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((d) => (
              <li key={d.id}><Link href={`/design/${d.id}`} className="card block p-4 hover:shadow-lg"><p className="font-semibold">{d.title}</p><p className="muted text-sm">{t.design.styles[d.style as keyof typeof t.design.styles] ?? d.style} · {fmt.format(d.updatedAt)} · v{d._count.versions}</p></Link></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

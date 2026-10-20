import { Sprout } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui";
import { SowView } from "@/components/SowView";

export const metadata = { title: "Qué sembrar" };

export default async function SowPage() {
  const user = await requirePageUser("/sow");
  const { t } = await getDictionary();
  const locations = await db.location.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }], select: { id: true, label: true, city: true, countryName: true } });
  return (
    <div className="fade-in">
      <PageHeader title={t.sow.title} intro={t.sow.intro} icon={<Sprout className="h-6 w-6" aria-hidden />} />
      <SowView locations={locations} />
    </div>
  );
}

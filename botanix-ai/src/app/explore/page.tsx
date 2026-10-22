import { BookOpen } from "lucide-react";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui";
import { ExploreView } from "@/components/ExploreView";

export const metadata = { title: "Explorar" };
export default async function ExplorePage() {
  await requirePageUser("/explore");
  const { t } = await getDictionary();
  return (
    <div className="fade-in">
      <PageHeader title={t.explore.title} intro={t.explore.intro} icon={<BookOpen className="h-6 w-6" aria-hidden />} />
      <ExploreView />
    </div>
  );
}

import { ScanSearch } from "lucide-react";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import { analysisFormData } from "@/lib/services/page-data";
import { AnalysisForm } from "@/components/AnalysisForm";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Identificar" };

export default async function IdentifyPage() {
  const user = await requirePageUser("/identify");
  const { t } = await getDictionary();
  const data = await analysisFormData(user);
  return (
    <div className="fade-in">
      <PageHeader title={t.identify.title} intro={t.identify.intro} icon={<ScanSearch className="h-6 w-6" aria-hidden />} />
      <AnalysisForm kind="IDENTIFY" {...data} maxPhotos={Math.min(3, data.maxPhotos)} />
    </div>
  );
}

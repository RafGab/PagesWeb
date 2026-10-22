import { Stethoscope } from "lucide-react";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import { analysisFormData } from "@/lib/services/page-data";
import { AnalysisForm } from "@/components/AnalysisForm";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Diagnosticar" };

export default async function DiagnosePage() {
  const user = await requirePageUser("/diagnose");
  const { t } = await getDictionary();
  const data = await analysisFormData(user);
  return (
    <div className="fade-in">
      <PageHeader title={t.diagnose.title} intro={t.diagnose.intro} icon={<Stethoscope className="h-6 w-6" aria-hidden />} />
      <AnalysisForm kind="DIAGNOSE" {...data} />
    </div>
  );
}

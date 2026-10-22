import { MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import { analysisFormData } from "@/lib/services/page-data";
import { PageHeader } from "@/components/ui";
import { ChatView } from "@/components/ChatView";

export const metadata = { title: "Asistente" };
export default async function AssistantPage() {
  const user = await requirePageUser("/assistant");
  const { t } = await getDictionary();
  const { aiConfigured, aiHelp } = await analysisFormData(user);
  const conversations = await db.conversation.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 30, select: { id: true, title: true } });
  return (
    <div className="fade-in">
      <PageHeader title={t.assistant.title} intro={t.assistant.intro} icon={<MessageCircle className="h-6 w-6" aria-hidden />} />
      <ChatView conversations={conversations} aiConfigured={aiConfigured} aiHelp={aiHelp} />
    </div>
  );
}

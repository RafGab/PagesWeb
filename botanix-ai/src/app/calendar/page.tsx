import Link from "next/link";
import { CalendarDays, Download } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import { PageHeader, Card } from "@/components/ui";
import { RemindersView } from "@/components/RemindersView";

export const metadata = { title: "Calendario" };

export default async function CalendarPage() {
  const user = await requirePageUser("/calendar");
  const { t, locale } = await getDictionary();
  const reminders = await db.reminder.findMany({ where: { userId: user.id }, orderBy: [{ enabled: "desc" }, { nextDueAt: "asc" }], include: { userPlant: { select: { id: true, nickname: true } } } });
  const es = locale === "es";
  return (
    <div className="fade-in space-y-6">
      <PageHeader title={t.reminders.title} intro={es ? "Los recordatorios con 🌡 ajustan su intervalo al clima del mes: más riego con calor, menos en frío; el abonado se aplaza fuera de la temporada de crecimiento." : "Reminders marked 🌡 adapt to the month's climate: more watering in heat, less in cold; feeding is postponed outside the growing season."} icon={<CalendarDays className="h-6 w-6" aria-hidden />}
        actions={<a href="/api/export/reminders" className="btn btn-ghost !py-2 text-sm"><Download className="h-4 w-4" aria-hidden /> {t.reminders.exportIcs}</a>} />
      <Card><RemindersView reminders={JSON.parse(JSON.stringify(reminders))} /></Card>
      <p className="text-sm muted">{es ? "Para crear recordatorios, abre una planta en " : "To create reminders, open a plant in "}<Link href="/plants" className="underline">{t.nav.plants}</Link>. {es ? "Las tareas estacionales de tu zona están en " : "Seasonal tasks for your area are in "}<Link href="/sow" className="underline">{t.nav.sow}</Link>.</p>
    </div>
  );
}

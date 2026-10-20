import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { toIcs } from "@/lib/exports/ics";

export const GET = route(async () => {
  const user = await requireUser();
  const reminders = await db.reminder.findMany({ where: { userId: user.id, enabled: true }, include: { userPlant: { select: { nickname: true } } } });
  const events = reminders.map((r) => ({
    uid: `rem-${r.id}`,
    title: r.userPlant ? `${r.title} · ${r.userPlant.nickname}` : r.title,
    description: r.seasonAdaptive ? "Intervalo base; Botanix lo ajusta al clima del mes al marcarlo como hecho." : undefined,
    date: r.nextDueAt,
    rrule: `FREQ=DAILY;INTERVAL=${r.intervalDays}`,
  }));
  return new Response(toIcs("Botanix · Recordatorios", events), { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `attachment; filename="botanix-recordatorios.ics"` } });
});

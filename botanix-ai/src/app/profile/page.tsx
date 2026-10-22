import { UserRound } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import { PLANS } from "@/lib/plans";
import { monthStart, monthlyCostUsd } from "@/lib/services/usage";
import { PageHeader, Card, Notice } from "@/components/ui";
import { LocationManager } from "@/components/LocationManager";
import { ProfileForm } from "@/components/ProfileForm";
import { DangerZone } from "@/components/DangerZone";

export const metadata = { title: "Perfil" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requirePageUser("/profile");
  const { t, locale } = await getDictionary();
  const { welcome } = await searchParams;
  const since = monthStart();
  const [locations, analyses, designs, chat, cost] = await Promise.all([
    db.location.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }),
    db.analysis.count({ where: { userId: user.id, kind: { in: ["IDENTIFY", "DIAGNOSE"] }, createdAt: { gte: since }, status: { notIn: ["FAILED", "NOT_CONFIGURED"] } } }),
    db.analysis.count({ where: { userId: user.id, kind: "GARDEN_SPACE", createdAt: { gte: since }, status: { notIn: ["FAILED", "NOT_CONFIGURED"] } } }),
    db.chatMessage.count({ where: { role: "user", createdAt: { gte: since }, conversation: { userId: user.id } } }),
    monthlyCostUsd(user.id),
  ]);
  const plan = PLANS[user.plan];
  const bar = (used: number, max: number) => (
    <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(100, (used / max) * 100)}%` }} /></div>
  );
  const es = locale === "es";
  return (
    <div className="fade-in space-y-6">
      <PageHeader title={t.profile.title} icon={<UserRound className="h-6 w-6" aria-hidden />} />
      {welcome && <Notice>{es ? "¡Bienvenida/o! Empieza añadiendo tu ubicación para que las recomendaciones se adapten a tu clima." : "Welcome! Start by adding your location so recommendations match your climate."}</Notice>}
      <Card><h2 id="locations" className="section-title mb-3 scroll-mt-24">{t.profile.locations}</h2><LocationManager locations={locations} /></Card>
      <Card>
        <h2 className="section-title mb-3">{t.profile.title}</h2>
        <ProfileForm user={{ ...user, imageConsentAt: user.imageConsentAt?.toISOString() ?? null }} />
      </Card>
      <Card>
        <h2 className="section-title mb-1">{t.profile.plan}: {plan.label[es ? "es" : "en"]}</h2>
        <p className="muted mb-4 text-sm">{t.profile.usage}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><p className="text-sm">{es ? "Análisis" : "Analyses"}: <b>{analyses}</b> / {plan.analysesPerMonth}</p>{bar(analyses, plan.analysesPerMonth)}</div>
          <div><p className="text-sm">{es ? "Diseños" : "Designs"}: <b>{designs}</b> / {plan.gardenDesignsPerMonth}</p>{bar(designs, plan.gardenDesignsPerMonth)}</div>
          <div><p className="text-sm">{es ? "Mensajes" : "Messages"}: <b>{chat}</b> / {plan.chatMessagesPerMonth}</p>{bar(chat, plan.chatMessagesPerMonth)}</div>
        </div>
        <p className="muted mt-3 text-xs">{es ? `Coste de IA estimado este mes: ${cost.toFixed(3)} USD. Los planes de pago no están activados todavía.` : `Estimated AI cost this month: ${cost.toFixed(3)} USD. Paid plans are not enabled yet.`}</p>
      </Card>
      <Card><h2 className="section-title mb-3">{es ? "Tus datos" : "Your data"}</h2><DangerZone /></Card>
    </div>
  );
}

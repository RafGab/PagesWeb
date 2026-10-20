import Link from "next/link";
import { ScanSearch, Stethoscope, Shovel, Sprout, Leaf, CalendarDays, BookOpen, MessageCircle, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/server";
import { db } from "@/lib/db";
import { HeroIllustration } from "@/components/HeroIllustration";

const ACTIONS = [
  ["identify", "/identify", ScanSearch],
  ["diagnose", "/diagnose", Stethoscope],
  ["design", "/design", Shovel],
  ["sow", "/sow", Sprout],
  ["plants", "/plants", Leaf],
  ["calendar", "/calendar", CalendarDays],
  ["explore", "/explore", BookOpen],
  ["assistant", "/assistant", MessageCircle],
] as const;

export default async function Home() {
  const { t, locale } = await getDictionary();
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="fade-in">
        <section className="grid items-center gap-10 py-6 lg:grid-cols-2 lg:py-14">
          <div>
            <p className="chip chip-green mb-4">{t.app.tagline}</p>
            <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">{t.home.heroTitle}</h1>
            <p className="muted mt-5 max-w-xl text-lg">{t.home.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn btn-primary">{t.home.start} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              <Link href="/login" className="btn btn-ghost">{t.home.haveAccount}</Link>
            </div>
            <ul className="mt-8 space-y-2">
              {t.home.trust.map((x) => (
                <li key={x} className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-[var(--color-forest-600)]" aria-hidden /> {x}</li>
              ))}
            </ul>
          </div>
          <HeroIllustration />
        </section>
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIONS.map(([key, , Icon]) => (
            <div key={key} className="card p-5">
              <Icon className="h-6 w-6 text-[var(--color-forest-600)]" aria-hidden />
              <p className="mt-3 font-semibold">{t.home.actions[key][0]}</p>
              <p className="muted text-sm">{t.home.actions[key][1]}</p>
            </div>
          ))}
        </section>
      </div>
    );
  }

  const [location, due, recent] = await Promise.all([
    db.location.findFirst({ where: { userId: user.id }, orderBy: { isDefault: "desc" } }),
    db.reminder.findMany({ where: { userId: user.id, enabled: true, nextDueAt: { lte: new Date(Date.now() + 2 * 86_400_000) } }, orderBy: { nextDueAt: "asc" }, take: 5, include: { userPlant: { select: { nickname: true } } } }),
    db.analysis.findMany({ where: { userId: user.id, status: "COMPLETED", kind: { in: ["IDENTIFY", "DIAGNOSE"] } }, orderBy: { createdAt: "desc" }, take: 4 }),
  ]);
  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

  return (
    <div className="fade-in space-y-8">
      <section>
        <h1 className="text-3xl font-semibold sm:text-4xl">{t.home.hello}{user.name ? `, ${user.name}` : ""} 🌿</h1>
        {location ? (
          <p className="muted mt-1 flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden /> {[location.city, location.region, location.countryName].filter(Boolean).join(", ")}</p>
        ) : (
          <div className="card mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2"><MapPin className="h-5 w-5 text-[var(--color-clay-500)]" aria-hidden /> {t.home.noLocation}</p>
            <Link href="/profile#locations" className="btn btn-primary !py-2">{t.home.addLocation}</Link>
          </div>
        )}
      </section>

      <section aria-label="Acciones" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map(([key, href, Icon], i) => (
          <Link key={key} href={href} className={`card group flex flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${i < 4 ? "sm:min-h-36" : ""}`}>
            <span className={`w-fit rounded-2xl p-2.5 ${i === 0 ? "bg-[var(--color-forest-700)] text-white" : "bg-[var(--color-sage-100)] text-[var(--color-forest-700)]"}`}>
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <span className="font-semibold leading-tight">{t.home.actions[key][0]}</span>
            <span className="muted hidden text-sm sm:block">{t.home.actions[key][1]}</span>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="section-title mb-3">{t.home.dueReminders}</h2>
          {due.length ? (
            <ul className="divide-y divide-[var(--line)]">
              {due.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2.5">
                  <span>{r.title}{r.userPlant ? <span className="muted"> · {r.userPlant.nickname}</span> : null}</span>
                  <span className={`chip ${r.nextDueAt < new Date() ? "chip-red" : "chip-amber"}`}>{dateFmt.format(r.nextDueAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">{t.reminders.none}</p>
          )}
          <Link href="/calendar" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">{t.nav.calendar} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </section>
        <section className="card p-5">
          <h2 className="section-title mb-3">{t.home.recent}</h2>
          {recent.length ? (
            <ul className="divide-y divide-[var(--line)]">
              {recent.map((a) => {
                const r = a.result as { identification?: { candidates: { scientific_name: string }[] }; diagnosis?: { primary: { problem: string } } };
                const label = r?.identification?.candidates[0]?.scientific_name ?? r?.diagnosis?.primary.problem ?? "—";
                return (
                  <li key={a.id}>
                    <Link href={`/analyses/${a.id}`} className="flex items-center justify-between py-2.5 hover:underline">
                      <span className={r?.identification ? "italic" : ""}>{label}</span>
                      <span className="chip">{a.kind === "IDENTIFY" ? t.nav.identify : t.nav.diagnose}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">{t.common.empty}</p>
          )}
          <Link href="/history" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">{t.nav.history} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </section>
      </div>
    </div>
  );
}

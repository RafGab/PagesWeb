"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Home, ScanSearch, Sprout, Leaf, Menu, Stethoscope, Shovel, CalendarDays, BookOpen, MessageCircle, History, UserRound } from "lucide-react";
import { useI18n } from "./i18n";
import { useState } from "react";

export function DesktopNav() {
  const { t } = useI18n();
  const path = usePathname();
  const items = [
    ["/identify", t.nav.identify], ["/diagnose", t.nav.diagnose], ["/design", t.nav.design], ["/sow", t.nav.sow],
    ["/plants", t.nav.plants], ["/calendar", t.nav.calendar], ["/explore", t.nav.explore], ["/assistant", t.nav.assistant],
  ] as const;
  return (
    <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
      {items.map(([href, label]) => (
        <Link key={href} href={href} aria-current={path.startsWith(href) ? "page" : undefined}
          className={clsx("rounded-full px-3 py-2 text-sm font-medium hover:bg-[var(--surface-2)]", path.startsWith(href) && "bg-[var(--color-sage-100)] text-[var(--color-forest-800)]")}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNav() {
  const { t } = useI18n();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const main = [
    ["/", t.nav.home, Home], ["/identify", t.nav.identify, ScanSearch], ["/sow", t.nav.sow, Sprout], ["/plants", t.nav.plants, Leaf],
  ] as const;
  const more = [
    ["/diagnose", t.nav.diagnose, Stethoscope], ["/design", t.nav.design, Shovel], ["/calendar", t.nav.calendar, CalendarDays], ["/explore", t.nav.explore, BookOpen],
    ["/assistant", t.nav.assistant, MessageCircle], ["/history", t.nav.history, History], ["/profile", t.nav.profile, UserRound],
  ] as const;
  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-20 z-40 grid grid-cols-3 gap-2 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-xl lg:hidden fade-in" role="menu">
          {more.map(([href, label, Icon]) => (
            <Link key={href} href={href} role="menuitem" onClick={() => setOpen(false)} className="flex flex-col items-center gap-1 rounded-2xl p-3 text-center text-xs font-medium hover:bg-[var(--surface-2)]">
              <Icon className="h-5 w-5" aria-hidden /> {label}
            </Link>
          ))}
        </div>
      )}
      <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {main.map(([href, label, Icon]) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <li key={href}>
                <Link href={href} aria-current={active ? "page" : undefined} className={clsx("flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium", active ? "text-[var(--accent)]" : "muted")}>
                  <Icon className="h-5 w-5" aria-hidden /> {label}
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium muted">
              <Menu className="h-5 w-5" aria-hidden /> {t.common.seeMore}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

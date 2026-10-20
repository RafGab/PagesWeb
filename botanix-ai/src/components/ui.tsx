import clsx from "clsx";
import type { ReactNode } from "react";

export function PageHeader({ title, intro, icon, actions }: { title: string; intro?: string; icon?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-1 rounded-2xl bg-[var(--color-sage-100)] p-2.5 text-[var(--color-forest-700)]">{icon}</div>}
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
          {intro && <p className="muted mt-1 max-w-2xl">{intro}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={clsx("card p-5", className)}>{children}</section>;
}

export function Collapsible({ title, children, defaultOpen = false, badge }: { title: string; children: ReactNode; defaultOpen?: boolean; badge?: ReactNode }) {
  return (
    <details className="card group overflow-hidden" open={defaultOpen}>
      <summary className="flex min-h-12 items-center justify-between gap-3 px-5 py-3.5 font-semibold">
        <span className="flex items-center gap-2">{title} {badge}</span>
        <span aria-hidden className="text-xl transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-[var(--line)] px-5 py-4">{children}</div>
    </details>
  );
}

export function List({ items, empty = "—" }: { items: (string | null | undefined)[]; empty?: string }) {
  const xs = items.filter((x): x is string => Boolean(x && x.trim()));
  if (!xs.length) return <p className="muted">{empty}</p>;
  return (
    <ul className="space-y-1.5">
      {xs.map((x, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-sage-500)]" />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

export function Field({ label, value, unknown }: { label: string; value: ReactNode; unknown: string }) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div className="rounded-xl bg-[var(--surface-2)] px-3 py-2.5">
      <dt className="text-xs font-semibold uppercase tracking-wide muted">{label}</dt>
      <dd className={clsx("mt-0.5", empty && "muted italic")}>{empty ? unknown : value}</dd>
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "danger" | "test"; children: ReactNode }) {
  const cls = {
    info: "bg-[var(--color-sage-100)] text-[var(--color-forest-800)] border-[var(--color-sage-300)]",
    warn: "bg-[var(--color-sun-100)] text-[#5e4500] border-[#efd88c]",
    danger: "bg-[var(--color-berry-100)] text-[var(--color-berry-600)] border-[#eeb8c3]",
    test: "bg-[#fde7f3] text-[#7a1650] border-[#f1a9cf] font-semibold",
  }[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={clsx("rounded-2xl border px-4 py-3 text-sm", cls)}>
      {children}
    </div>
  );
}

export function ConfidenceMeter({ score, level, label }: { score: number; level: "high" | "medium" | "low"; label: string }) {
  const color = level === "high" ? "var(--color-forest-600)" : level === "medium" ? "var(--color-sun-500)" : "var(--color-clay-500)";
  return (
    <div className="flex items-center gap-2" aria-label={`${label}: ${score}/100 (${level})`}>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--surface-2)]" aria-hidden>
        <div className="h-full rounded-full" style={{ width: `${Math.max(4, Math.min(100, score))}%`, background: color }} />
      </div>
      <span className="text-sm font-semibold tabular-nums">{score}</span>
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-10 text-center">
      {icon && <div className="rounded-full bg-[var(--color-sage-100)] p-4 text-[var(--color-forest-700)]">{icon}</div>}
      <p className="text-lg font-semibold">{title}</p>
      {children}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center gap-3">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-sage-300)] border-t-[var(--accent)]" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

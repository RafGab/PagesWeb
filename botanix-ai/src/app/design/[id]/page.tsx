import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Printer } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import type { GardenDesign } from "@/lib/domain/garden-design";
import { shoppingList } from "@/lib/garden/shopping";
import { notConfigured } from "@/lib/ai/providers/unconfigured";
import { PageHeader, Card, Collapsible, List, Notice } from "@/components/ui";
import { GardenPlan } from "@/components/GardenPlan";
import { Poller } from "@/components/Poller";
import { ReviseForm } from "@/components/ReviseForm";
import { NotConfigured } from "@/components/NotConfigured";
import { PrintButton } from "@/components/PrintButton";

export const metadata = { title: "Diseño" };

export default async function DesignDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ v?: string }> }) {
  const { id } = await params;
  const { v } = await searchParams;
  const user = await requirePageUser(`/design/${id}`);
  const { t, locale } = await getDictionary();
  const lang = locale === "en" ? "en" : "es";
  const d = t.design;
  const design = await db.gardenDesign.findFirst({ where: { id, userId: user.id }, include: { versions: { orderBy: { version: "desc" } } } });
  if (!design) notFound();
  const latest = await db.analysis.findFirst({ where: { userId: user.id, kind: "GARDEN_SPACE", context: { path: ["designId"], equals: id } }, orderBy: { createdAt: "desc" } });
  const version = design.versions.find((x) => String(x.version) === v) ?? design.versions[0];
  const busy = latest && (latest.status === "PENDING" || latest.status === "PROCESSING");
  const inputs = design.inputs as { plotWidthM?: number | null; plotDepthM?: number | null; orientationOfMainArea?: string };
  const g = version ? (version.proposal as unknown as GardenDesign) : null;
  const money = (n: number, cur: string) => new Intl.NumberFormat(locale, { style: "currency", currency: /^[A-Z]{3}$/.test(cur) ? cur : "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="fade-in space-y-6">
      <PageHeader title={design.title} intro={d.styles[design.style as keyof typeof d.styles] ?? design.style}
        actions={g && <PrintButton label={t.common.print} icon={<Printer className="h-4 w-4" aria-hidden />} />} />

      {design.versions.length > 1 && (
        <nav aria-label={d.versions} className="flex flex-wrap gap-2 no-print">
          {design.versions.map((x) => (
            <Link key={x.id} href={`/design/${id}?v=${x.version}`} className={`chip !py-1.5 !px-3 ${x.id === version?.id ? "chip-green" : ""}`} aria-current={x.id === version?.id ? "page" : undefined}>
              v{x.version}{x.changeRequest ? ` · ${x.changeRequest.slice(0, 30)}…` : ""}
            </Link>
          ))}
        </nav>
      )}

      {busy && latest && <Poller analysisId={latest.id} label={lang === "es" ? "Diseñando propuestas… (puede tardar un par de minutos)" : "Designing proposals… (may take a couple of minutes)"} />}
      {latest?.status === "FAILED" && <Notice tone="danger">{latest.errorMessage}</Notice>}
      {latest?.status === "NOT_CONFIGURED" && <NotConfigured message={t.errors.AI_NOT_CONFIGURED} help={(notConfigured().details as { help: string[] }).help} />}
      {version?.isTestFixture && <Notice tone="test">{t.common.testData}</Notice>}
      {latest?.status === "COMPLETED" && latest.warnings.length > 0 && version && <Notice tone="warn"><ul className="space-y-1">{latest.warnings.map((w) => <li key={w}>• {w}</li>)}</ul></Notice>}

      {g && version && (
        <>
          <Card>
            <h2 className="section-title mb-2">{d.space}</h2>
            <p>{g.space_analysis.summary}</p>
            <div className="mt-3 grid gap-4 md:grid-cols-3 text-sm">
              <div><p className="font-semibold">{lang === "es" ? "Dimensiones" : "Dimensions"}</p><p>{g.space_analysis.estimated_dimensions ?? "—"} <span className="chip ml-1">{g.space_analysis.dimensions_confidence}</span></p></div>
              <div><p className="font-semibold">{lang === "es" ? "Sol y sombra" : "Sun & shade"}</p><p>{g.space_analysis.sun_shade_observations}</p></div>
              <div><p className="font-semibold">{lang === "es" ? "Pendiente y drenaje" : "Slope & drainage"}</p><p>{g.space_analysis.slope_drainage_observations}</p></div>
              <div><p className="font-semibold">{lang === "es" ? "Elementos existentes" : "Existing elements"}</p><List items={g.space_analysis.existing_elements.map((e) => `${e.keep ? "✓" : "✗"} ${e.element}${e.notes ? ` — ${e.notes}` : ""}`)} /></div>
              <div><p className="font-semibold">{lang === "es" ? "Oportunidades" : "Opportunities"}</p><List items={g.space_analysis.opportunities} /></div>
              <div><p className="font-semibold">{lang === "es" ? "Limitaciones" : "Constraints"}</p><List items={g.space_analysis.constraints} /></div>
            </div>
            {g.space_analysis.data_needed_from_user.length > 0 && <div className="mt-3"><Notice><b>{lang === "es" ? "Datos que mejorarían el diseño" : "Data that would improve the design"}:</b> {g.space_analysis.data_needed_from_user.join(" · ")}</Notice></div>}
            <p className="mt-3 text-sm"><b>{lang === "es" ? "Estilo recomendado" : "Recommended style"}:</b> {g.recommended_style} — {g.style_rationale}</p>
          </Card>

          {g.proposals.length > 1 && (
            <Card>
              <h2 className="section-title mb-3">{d.compare}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="muted"><th className="py-2 pr-3"></th>{g.proposals.map((p) => <th key={p.title} className="py-2 pr-3">{p.title}</th>)}</tr></thead>
                  <tbody>
                    <tr className="border-t border-[var(--line)]"><th className="py-2 pr-3">{d.style}</th>{g.proposals.map((p) => <td key={p.title} className="pr-3">{p.style}</td>)}</tr>
                    <tr className="border-t border-[var(--line)]"><th className="py-2 pr-3">{d.plants}</th>{g.proposals.map((p) => <td key={p.title} className="pr-3">{p.plants.reduce((a, x) => a + x.quantity, 0)} ud. · {new Set(p.plants.map((x) => x.scientific_name)).size} spp.</td>)}</tr>
                    <tr className="border-t border-[var(--line)]"><th className="py-2 pr-3">{d.lawn}</th>{g.proposals.map((p) => <td key={p.title} className="pr-3">{p.lawn_or_groundcover.choice}</td>)}</tr>
                    <tr className="border-t border-[var(--line)]"><th className="py-2 pr-3">{lang === "es" ? "Agua" : "Water"}</th>{g.proposals.map((p) => <td key={p.title} className="pr-3">{["low", "medium", "high"].map((w) => `${p.plants.filter((x) => x.water === w).length}`).join(" / ")} <span className="muted">({lang === "es" ? "baja/media/alta" : "low/med/high"})</span></td>)}</tr>
                    {(["economy", "balanced", "premium"] as const).map((tier) => (
                      <tr key={tier} className="border-t border-[var(--line)]"><th className="py-2 pr-3">{d.tiers[tier]}</th>{g.proposals.map((p) => <td key={p.title} className="pr-3 tabular-nums">{money(p.cost_estimate.tiers[tier].total_low, p.cost_estimate.currency)}–{money(p.cost_estimate.tiers[tier].total_high, p.cost_estimate.currency)}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {g.proposals.map((p, i) => (
            <section key={p.title + i} className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div><p className="muted text-sm">{lang === "es" ? "Propuesta" : "Proposal"} {i + 1}</p><h2 className="text-2xl font-semibold">{p.title}</h2></div>
                <a href={`/api/export/shopping-list?versionId=${version.id}&proposal=${i}`} className="btn btn-ghost !py-2 text-sm no-print"><Download className="h-4 w-4" aria-hidden /> {d.shopping} (CSV)</a>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                <Card>
                  <h3 className="mb-2 font-semibold">{d.plan}</h3>
                  <GardenPlan proposal={p} width={g.plan_width_m ?? inputs.plotWidthM ?? null} depth={g.plan_depth_m ?? inputs.plotDepthM ?? null} lang={lang} orientation={inputs.orientationOfMainArea} />
                  <p className="muted mt-2 text-xs">{d.planNote} {!(g.plan_width_m && g.plan_depth_m) && d.noMeasures}</p>
                </Card>
                <Card>
                  <p className="font-semibold">{p.concept}</p>
                  <p className="mt-2 text-sm">{p.visual_description}</p>
                  <p className="muted mt-3 text-xs">{d.visualNote}</p>
                  <h3 className="mt-4 mb-1 font-semibold">{lang === "es" ? "Zonas" : "Zones"}</h3>
                  <List items={p.zones.map((z) => `${z.name}: ${z.purpose} (${z.width_m} × ${z.depth_m} m)`)} />
                </Card>
              </div>
              <Card>
                <h3 className="mb-3 font-semibold">{d.plants}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="muted"><th className="py-1.5 pr-3">{lang === "es" ? "Planta" : "Plant"}</th><th className="pr-3">{lang === "es" ? "Cant." : "Qty"}</th><th className="pr-3">{lang === "es" ? "Zona" : "Zone"}</th><th className="pr-3">{lang === "es" ? "Marco" : "Spacing"}</th><th className="pr-3">{lang === "es" ? "Tamaño adulto" : "Mature size"}</th><th className="pr-3">{lang === "es" ? "Luz / agua" : "Light / water"}</th></tr></thead>
                    <tbody>
                      {p.plants.map((pl, k) => (
                        <tr key={k} className="border-t border-[var(--line)] align-top">
                          <td className="py-2 pr-3"><b>{pl.common_name}</b><br /><i className="muted">{pl.scientific_name}</i>{pl.toxicity_warning && <p className="text-xs text-[var(--color-berry-600)]">☠ {pl.toxicity_warning}</p>}{pl.invasive_warning && <p className="text-xs text-[var(--color-clay-500)]">⚠ {pl.invasive_warning}</p>}</td>
                          <td className="pr-3 tabular-nums">{pl.quantity}</td>
                          <td className="pr-3">{p.zones.find((z) => z.id === pl.zone_id)?.name ?? pl.zone_id}</td>
                          <td className="pr-3">{pl.spacing_m != null ? `${pl.spacing_m} m` : "—"}</td>
                          <td className="pr-3">{pl.adult_size}</td>
                          <td className="pr-3">{pl.light} · {pl.water}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <div className="grid gap-4 md:grid-cols-2">
                <Collapsible title={d.cost} defaultOpen>
                  <Notice tone="warn">{d.costNote}</Notice>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                    {(["economy", "balanced", "premium"] as const).map((tier) => (
                      <div key={tier} className="rounded-xl bg-[var(--surface-2)] p-2"><p className="font-semibold">{d.tiers[tier]}</p><p className="tabular-nums">{money(p.cost_estimate.tiers[tier].total_low, p.cost_estimate.currency)}–{money(p.cost_estimate.tiers[tier].total_high, p.cost_estimate.currency)}</p><p className="muted text-xs">{p.cost_estimate.tiers[tier].description}</p></div>
                    ))}
                  </div>
                  <table className="mt-3 w-full text-sm">
                    <tbody>{p.cost_estimate.lines.map((l, k) => <tr key={k} className="border-t border-[var(--line)]"><td className="py-1.5 pr-2"><span className="chip mr-1">{l.category}</span>{l.item}</td><td className="text-right tabular-nums">{money(l.low, p.cost_estimate.currency)}–{money(l.high, p.cost_estimate.currency)}</td></tr>)}</tbody>
                  </table>
                </Collapsible>
                <Collapsible title={d.shopping}>
                  <table className="w-full text-sm"><tbody>{shoppingList(p).map((r, k) => <tr key={k} className="border-t border-[var(--line)] align-top"><td className="py-1.5 pr-2">{r.item}<p className="muted text-xs">{r.basis}</p></td><td className="whitespace-nowrap text-right font-semibold">{r.quantity}</td></tr>)}</tbody></table>
                </Collapsible>
                <Collapsible title={`${d.lawn} · ${d.irrigation} · ${d.drainage}`}>
                  <p><b>{d.lawn}:</b> {p.lawn_or_groundcover.choice} — {p.lawn_or_groundcover.rationale}</p>
                  {p.lawn_or_groundcover.alternatives.length > 0 && <p className="muted text-sm">{p.lawn_or_groundcover.alternatives.join(" · ")}</p>}
                  <p className="mt-2"><b>{d.irrigation}:</b> {p.irrigation}</p>
                  <p className="mt-2"><b>{d.drainage}:</b> {p.drainage_soil}</p>
                  <p className="mt-2 font-semibold">{d.materials}</p>
                  <List items={p.materials.map((m) => `${m.item}${m.quantity ? ` — ${m.quantity}` : ""}${m.notes ? ` (${m.notes})` : ""}`)} />
                </Collapsible>
                <Collapsible title={d.phases}>
                  <ol className="space-y-2">{p.phases.map((ph, k) => <li key={k}><b>{k + 1}. {ph.phase}</b>{ph.season && <span className="muted"> · {ph.season}</span>}<List items={ph.tasks} /></li>)}</ol>
                </Collapsible>
                <Collapsible title={d.maintenanceTitle}>
                  <p className="font-semibold">{d.monthly}</p><List items={p.maintenance.monthly} />
                  <p className="mt-2 font-semibold">{d.annual}</p><List items={p.maintenance.annual} />
                </Collapsible>
                <Collapsible title={`${d.alternatives} · ${d.mistakes}`}>
                  <p className="font-semibold">{d.alternatives}</p><List items={p.budget_alternatives} />
                  <p className="mt-2 font-semibold">{d.mistakes}</p><List items={p.mistakes_to_avoid} />
                </Collapsible>
              </div>
            </section>
          ))}

          {!busy && <Card className="no-print"><ReviseForm designId={design.id} versionId={version.id} /></Card>}
        </>
      )}
    </div>
  );
}

import type { Proposal } from "@/lib/domain/garden-design";
import { SURFACE_STYLE, planBounds } from "@/lib/garden/plan";

/** Plano esquemático en SVG generado a partir de las zonas de la propuesta. */
export function GardenPlan({ proposal, width, depth, lang, orientation }: { proposal: Proposal; width: number | null; depth: number | null; lang: "es" | "en"; orientation?: string }) {
  const { W, D, scaled } = planBounds(proposal, width, depth);
  const S = 600 / Math.max(W, D);
  const vw = W * S, vh = D * S;
  const used = [...new Set(proposal.zones.map((z) => z.surface))];
  const plantsByZone = new Map<string, number>();
  for (const p of proposal.plants) plantsByZone.set(p.zone_id, (plantsByZone.get(p.zone_id) ?? 0) + p.quantity);
  const step = W > 30 ? 10 : W > 12 ? 5 : 1;
  return (
    <figure>
      <svg viewBox={`-30 -10 ${vw + 40} ${vh + 40}`} className="w-full rounded-2xl bg-[var(--surface-2)]" role="img" aria-label={lang === "es" ? "Plano esquemático del jardín" : "Schematic garden plan"}>
        <defs>
          <pattern id="grid" width={S * step} height={S * step} patternUnits="userSpaceOnUse"><path d={`M ${S * step} 0 L 0 0 0 ${S * step}`} fill="none" stroke="var(--viz-grid)" strokeWidth="1" /></pattern>
        </defs>
        <rect x={0} y={0} width={vw} height={vh} fill="url(#grid)" stroke="var(--muted)" strokeWidth="2" strokeDasharray={scaled ? undefined : "6 4"} />
        {proposal.zones.map((z) => {
          const x = z.x_m * S, y = z.y_m * S, w = z.width_m * S, h = z.depth_m * S;
          const n = plantsByZone.get(z.id);
          return (
            <g key={z.id}>
              <rect x={x + 1} y={y + 1} width={Math.max(2, w - 2)} height={Math.max(2, h - 2)} rx={6} fill={SURFACE_STYLE[z.surface].fill} stroke="#ffffff" strokeWidth="2">
                <title>{`${z.name} — ${z.purpose} (${z.width_m} × ${z.depth_m} m)`}</title>
              </rect>
              {w > 50 && h > 26 && (
                <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle" fontSize={Math.min(14, w / 8)} fill="#14261b" fontWeight="600">
                  {z.name}{n ? ` · ${n}` : ""}
                </text>
              )}
            </g>
          );
        })}
        {scaled && (
          <g fontSize="11" fill="var(--muted)">
            <text x={vw / 2} y={vh + 22} textAnchor="middle">{W} m</text>
            <text x={-14} y={vh / 2} textAnchor="middle" transform={`rotate(-90 -14 ${vh / 2})`}>{D} m</text>
          </g>
        )}
        {orientation && orientation !== "unknown" && <text x={vw - 6} y={14} textAnchor="end" fontSize="11" fill="var(--muted)">{lang === "es" ? "Orientación" : "Facing"}: {orientation}</text>}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-2 text-xs">
        {used.map((s) => (
          <span key={s} className="chip"><span className="inline-block h-3 w-3 rounded" style={{ background: SURFACE_STYLE[s].fill }} aria-hidden /> {SURFACE_STYLE[s].label[lang]}</span>
        ))}
      </figcaption>
    </figure>
  );
}

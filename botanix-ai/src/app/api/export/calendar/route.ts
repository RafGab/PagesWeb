import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { climateForUser } from "@/lib/services/sowing";
import { buildCalendar } from "@/lib/sowing/calendar";
import { CROP_BY_SLUG } from "@/lib/sowing/crops";
import { toCsv } from "@/lib/exports/csv";
import { toIcs } from "@/lib/exports/ics";
import { LOCALES } from "@/lib/i18n/dictionaries";

const Q = z.object({ locationId: z.string().optional(), format: z.enum(["csv", "ics"]).default("csv") });

export const GET = route(async (req) => {
  const user = await requireUser();
  const q = Q.parse(Object.fromEntries(new URL(req.url).searchParams));
  const lang = user.locale === "en" ? "en" : "es";
  const t = LOCALES[lang];
  const { location, normals, summary } = await climateForUser(user, q.locationId);
  const cal = buildCalendar(normals.months, summary, location.latitude, lang);
  const name = (slug: string) => CROP_BY_SLUG.get(slug)?.names[lang] ?? slug;
  const keys = ["directSow", "seedbed", "transplant", "harvest", "flowers", "treesShrubs", "lawn", "prune", "fertilize", "maintenance", "protect", "postpone"] as const;
  const slugKeys = new Set(["directSow", "seedbed", "transplant", "harvest", "flowers", "treesShrubs", "lawn"]);
  const label = `${location.label} (${[location.city, location.countryName].filter(Boolean).join(", ")})`;

  if (q.format === "csv") {
    const rows: (string | number)[][] = [[lang === "es" ? "Mes" : "Month", ...keys.map((k) => t.sow.tasks[k])]];
    for (const m of cal.months) rows.push([t.common.monthsLong[m.month - 1], ...keys.map((k) => (slugKeys.has(k) ? (m[k] as string[]).map(name) : m[k]).join(", "))]);
    rows.push([]);
    rows.push([lang === "es" ? `Calendario calculado para ${label} con datos de ${normals.attribution}. ${normals.limitations}` : `Calendar computed for ${label} using ${normals.attribution}. ${normals.limitations}`]);
    return new Response(toCsv(rows), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="botanix-calendario.csv"` } });
  }

  // ICS: un evento anual el día 1 de cada mes con las tareas principales.
  const year = new Date().getUTCFullYear();
  const events = cal.months.map((m) => {
    const lines = keys.flatMap((k) => {
      const v = slugKeys.has(k) ? (m[k] as string[]).map(name) : (m[k] as string[]);
      return v.length ? [`${t.sow.tasks[k]}: ${v.join(", ")}`] : [];
    });
    return { uid: `cal-${location.id}-${m.month}`, title: `Botanix · ${t.common.monthsLong[m.month - 1]}`, description: lines.join("\n"), date: new Date(Date.UTC(year, m.month - 1, 1)), rrule: "FREQ=YEARLY" };
  });
  return new Response(toIcs(`Botanix · ${label}`, events), { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `attachment; filename="botanix-calendario.ics"` } });
});

import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/exports/csv";
import { toIcs } from "@/lib/exports/ics";
import { costUsd } from "@/lib/ai/pricing";
import { rateLimit, resetRateLimits } from "@/lib/security/rate-limit";
import { adaptedIntervalDays } from "@/lib/garden/reminders";
import { shoppingList } from "@/lib/garden/shopping";
import { GbifClient } from "@/lib/taxonomy/gbif";
import { FIXTURE_GARDEN, FIXTURE_IDENTIFICATION, FIXTURE_DIAGNOSIS } from "@/lib/ai/providers/fixture";
import { IdentificationSchema } from "@/lib/domain/identification";
import { DiagnosisSchema } from "@/lib/domain/diagnosis";
import { GardenDesignSchema } from "@/lib/domain/garden-design";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { plantSheetMarkdown } from "@/lib/exports/plant-sheet";
import { zodTextFormat } from "openai/helpers/zod";

describe("exportaciones", () => {
  it("CSV: escapa separadores y neutraliza fórmulas", () => {
    const csv = toCsv([["a;b", '=HYPERLINK("x")', 3]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain('"a;b"');
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
  });
  it("ICS: escapa texto, pliega líneas largas e incluye recurrencia", () => {
    const ics = toIcs("Prueba", [{ uid: "1", title: "Regar, abonar; podar", description: "x".repeat(200), date: new Date("2026-03-01T00:00:00Z"), rrule: "FREQ=DAILY;INTERVAL=7" }]);
    expect(ics).toContain("SUMMARY:Regar\\, abonar\; podar");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260301");
    expect(ics).toContain("RRULE:FREQ=DAILY;INTERVAL=7");
    expect(ics.split("\r\n").every((l) => Buffer.byteLength(l) <= 75)).toBe(true);
  });
  it("ficha Markdown incluye candidatos y avisos de prueba", () => {
    const md = plantSheetMarkdown(FIXTURE_IDENTIFICATION, [], ["Aviso"], new Date("2026-10-20"), true);
    expect(md).toContain("DATOS DE PRUEBA");
    expect(md).toContain("Monstera deliciosa");
  });
});

describe("costes", () => {
  it("calcula con la tarifa registrada y no inventa tarifas desconocidas", () => {
    expect(costUsd("claude-opus-5-5", 1_000_000, 100_000)).toBeCloseTo(6, 5);
    expect(costUsd("modelo-desconocido", 1000, 1000)).toBeNull();
    expect(costUsd("gpt-4o-mini-2024-07-18", 1_000_000, 1_000_000)).toBeCloseTo(0.75, 5);
    expect(costUsd("gpt-4o-2024-08-06", 1_000_000, 0)).toBeCloseTo(2.5, 5);
  });
});

describe("límite de peticiones", () => {
  it("bloquea al superar el límite y libera tras la ventana", () => {
    resetRateLimits();
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 1000, 0).ok).toBe(true);
    expect(rateLimit("k", 3, 1000, 10).ok).toBe(false);
    expect(rateLimit("k", 3, 1000, 2000).ok).toBe(true);
  });
});

describe("recordatorios adaptados a la estación", () => {
  const m = (tMean: number) => ({ month: 1, tMean, tMin: 0, tMax: 0, absMin: 0, absMax: 0, precipMm: 0, frostDays: 0, hotDays: 0, sunshineHours: null, et0Mm: null });
  it("riega más a menudo con calor y menos con frío", () => {
    expect(adaptedIntervalDays("WATERING", 10, m(28))).toBe(6);
    expect(adaptedIntervalDays("WATERING", 10, m(3))).toBe(20);
    expect(adaptedIntervalDays("WATERING", 10, null)).toBe(10);
  });
  it("aplaza el abonado fuera de la temporada de crecimiento", () => {
    expect(adaptedIntervalDays("FERTILIZING", 14, m(6))).toBe(30);
  });
});

describe("lista de compra", () => {
  it("calcula volúmenes de compost, acolchado y grava a partir de las zonas", () => {
    const rows = shoppingList(FIXTURE_GARDEN.proposals[0]);
    expect(rows.find((r) => r.item.startsWith("Compost"))?.quantity).toBe("0.8 m³");
    expect(rows.find((r) => r.item.startsWith("Grava"))?.quantity).toBe("0.4 m³");
    expect(rows.find((r) => r.category === "plants")?.quantity).toBe("10 ud.");
  });
});

describe("verificación taxonómica GBIF", () => {
  const client = (body: unknown, status = 200) => new GbifClient(async () => new Response(JSON.stringify(body), { status }));
  it("reconoce nombres aceptados", async () => {
    const v = await client({ usageKey: 1, scientificName: "Monstera deliciosa Liebm.", canonicalName: "Monstera deliciosa", rank: "SPECIES", status: "ACCEPTED", matchType: "EXACT", kingdom: "Plantae", family: "Araceae", genus: "Monstera" }).verify("Monstera deliciosa");
    expect(v).toMatchObject({ status: "accepted", authorship: "Liebm.", family: "Araceae", gbifKey: 1 });
  });
  it("detecta sinónimos y devuelve el nombre aceptado", async () => {
    const v = await client({ usageKey: 2, acceptedUsageKey: 3, canonicalName: "Philodendron selloum", species: "Thaumatophyllum bipinnatifidum", status: "SYNONYM", matchType: "EXACT", kingdom: "Plantae" }).verify("Philodendron selloum");
    expect(v).toMatchObject({ status: "synonym", acceptedName: "Thaumatophyllum bipinnatifidum", gbifKey: 3 });
  });
  it("no acepta coincidencias fuera del reino vegetal ni inventa si no hay resultado", async () => {
    expect((await client({ usageKey: 4, matchType: "EXACT", kingdom: "Animalia" }).verify("Lynx pardinus")).status).toBe("not_found");
    expect((await client({ matchType: "NONE" }).verify("Xyz abc")).status).toBe("not_found");
    expect((await client({}, 503).verify("Rosa")).status).toBe("unavailable");
  });
});

describe("esquemas de salida estructurada", () => {
  it("los datos de prueba cumplen los esquemas", () => {
    expect(() => IdentificationSchema.parse(FIXTURE_IDENTIFICATION)).not.toThrow();
    expect(() => DiagnosisSchema.parse(FIXTURE_DIAGNOSIS)).not.toThrow();
    expect(() => GardenDesignSchema.parse(FIXTURE_GARDEN)).not.toThrow();
  });
  it("los esquemas cumplen el modo estricto de salidas estructuradas de OpenAI", () => {
    const stats = (node: unknown, depth = 0): { props: number; depth: number } => {
      if (!node || typeof node !== "object") return { props: 0, depth };
      const n = node as Record<string, unknown>;
      let props = 0, max = depth;
      if (n.type === "object" && n.properties) {
        const keys = Object.keys(n.properties as object);
        props += keys.length;
        expect(n.additionalProperties).toBe(false);
        expect([...(n.required as string[])].sort()).toEqual([...keys].sort());
      }
      for (const v of Object.values(n)) {
        const s = stats(v, n.type === "object" ? depth + 1 : depth);
        props += s.props;
        max = Math.max(max, s.depth);
      }
      return { props, depth: max };
    };
    for (const [name, s] of [["identify", IdentificationSchema], ["diagnose", DiagnosisSchema], ["garden_design", GardenDesignSchema]] as const) {
      const f = zodTextFormat(s, name) as unknown as { type: string; strict: boolean; schema: object };
      expect(f.type).toBe("json_schema");
      expect(f.strict).toBe(true);
      const st = stats(f.schema);
      // Límites documentados del modo estricto: 5000 propiedades y 10 niveles de anidamiento.
      expect(st.props).toBeLessThan(5000);
      expect(st.depth).toBeLessThanOrEqual(10);
    }
  });
  it("los esquemas se pueden convertir al formato de salida estructurada de la API de Claude", () => {
    for (const s of [IdentificationSchema, DiagnosisSchema, GardenDesignSchema]) {
      const f = betaZodOutputFormat(s) as unknown as { type: string; schema: object };
      expect(f.type).toBe("json_schema");
      expect(JSON.stringify(f.schema).length).toBeGreaterThan(500);
    }
  });
});

import { describe, expect, it } from "vitest";
import { guardDiagnosis, guardGardenDesign, guardIdentification, stripDoses, isUncertainIdentification } from "@/lib/ai/guardrails";
import { FIXTURE_DIAGNOSIS, FIXTURE_GARDEN, FIXTURE_IDENTIFICATION } from "@/lib/ai/providers/fixture";

const id = () => structuredClone(FIXTURE_IDENTIFICATION);

describe("calidad: identificaciones", () => {
  it("ordena candidatos, acota puntuaciones y conserva la ficha si la confianza es alta", () => {
    const x = id();
    x.candidates[1].confidence_score = 150;
    x.candidates[1].confidence_level = "high";
    const g = guardIdentification(x);
    expect(g.data.candidates[0].confidence_score).toBe(100);
    expect(g.data.candidates.every((c) => c.confidence_score <= 100)).toBe(true);
  });
  it("marca como incierta una identificación con candidatos muy próximos", () => {
    const x = id();
    x.candidates[1].confidence_score = 80;
    expect(isUncertainIdentification(x)).toBe(true);
  });
  it("oculta usos comestibles o medicinales cuando la identificación no es segura", () => {
    const x = id();
    x.candidates[0].confidence_level = "medium";
    x.candidates[0].confidence_score = 55;
    x.profile!.uses = ["Ornamental", "Fruto comestible maduro", "Uso medicinal tradicional"];
    const g = guardIdentification(x);
    expect(g.data.profile!.uses).toEqual(["Ornamental"]);
    expect(g.warnings.join(" ")).toMatch(/comestibles/);
    expect(g.data.additional_photos_needed.length).toBeGreaterThan(0);
  });
  it("descarta la ficha si el candidato principal tiene confianza baja", () => {
    const x = id();
    x.candidates = [{ ...x.candidates[0], confidence_level: "low", confidence_score: 20 }];
    expect(guardIdentification(x).data.profile).toBeNull();
  });
  it("detecta incoherencias taxonómicas entre género y nombre científico", () => {
    const x = id();
    x.candidates[0].genus = "Philodendron";
    expect(guardIdentification(x).warnings.join(" ")).toMatch(/incoherencia taxonómica/);
  });
  it("si no es una planta, no devuelve candidatos ni ficha", () => {
    const x = id();
    x.is_plant = false;
    const g = guardIdentification(x);
    expect(g.data.candidates).toEqual([]);
    expect(g.data.profile).toBeNull();
  });
  it("avisa de toxicidad para niños y mascotas", () => {
    expect(guardIdentification(id()).warnings.join(" ")).toMatch(/tóxica/);
  });
});

describe("calidad: diagnósticos demasiado seguros y dosis", () => {
  it("rebaja la confianza alta si no hay causas alternativas", () => {
    const d = structuredClone(FIXTURE_DIAGNOSIS);
    d.primary.confidence_level = "high";
    d.primary.confidence_score = 95;
    d.alternatives = [];
    const g = guardDiagnosis(d);
    expect(g.data.primary.confidence_level).toBe("medium");
    expect(g.warnings.join(" ")).toMatch(/alternativas/);
  });
  it("rebaja la confianza si la foto no es utilizable", () => {
    const d = structuredClone(FIXTURE_DIAGNOSIS);
    d.primary.confidence_level = "high";
    d.primary.confidence_score = 90;
    d.image_quality.usable = false;
    expect(guardDiagnosis(d).data.primary.confidence_level).toBe("medium");
  });
  it("elimina cualquier dosis de la respuesta", () => {
    const d = structuredClone(FIXTURE_DIAGNOSIS);
    d.chemical_options[0].precautions = "Aplicar 5 ml/L de agua cada 7 días";
    d.recovery_plan[0].detail = "Pulverizar 2 g por litro";
    const g = guardDiagnosis(d);
    expect(JSON.stringify(g.data)).not.toMatch(/5 ml\/L|2 g por litro/);
    expect(g.warnings.join(" ")).toMatch(/dosis/);
  });
  it("añade cuándo acudir a un profesional en casos graves", () => {
    const d = structuredClone(FIXTURE_DIAGNOSIS);
    d.primary.severity = "urgent";
    d.when_to_call_professional = "";
    expect(guardDiagnosis(d).data.when_to_call_professional.length).toBeGreaterThan(10);
  });
  it("stripDoses reconoce formatos habituales y no toca texto sin cantidades", () => {
    expect(stripDoses("Mezclar 3 cucharadas en 1 litro").changed).toBe(true);
    expect(stripDoses("0,5 % de concentración").changed).toBe(true);
    expect(stripDoses("200 ppm").changed).toBe(true);
    expect(stripDoses("Riega cada 7 días y retira 2 hojas").changed).toBe(false);
  });
});

describe("calidad: diseños de jardín", () => {
  it("ajusta zonas que se salen del plano y avisa de presupuestos incoherentes", () => {
    const g = structuredClone(FIXTURE_GARDEN);
    g.proposals[0].zones[0].width_m = 20;
    g.proposals[0].cost_estimate.tiers.economy.total_low = 99999;
    const r = guardGardenDesign(g);
    const z = r.data.proposals[0].zones[0];
    expect(z.x_m + z.width_m).toBeLessThanOrEqual(8);
    expect(r.warnings.join(" ")).toMatch(/coherentes/);
    expect(r.warnings.join(" ")).toMatch(/orientativo/);
  });
  it("señala plantas asignadas a zonas inexistentes y advertencias de invasoras", () => {
    const g = structuredClone(FIXTURE_GARDEN);
    g.proposals[0].plants[0].zone_id = "zz";
    g.proposals[0].plants[0].invasive_warning = "Invasora en Canarias";
    const r = guardGardenDesign(g);
    expect(r.warnings.join(" ")).toMatch(/zona inexistente/);
    expect(r.warnings.join(" ")).toMatch(/Invasora/);
  });
});

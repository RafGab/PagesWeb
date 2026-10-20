import "../helpers/next";
import { beforeAll, describe, expect, it } from "vitest";
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import { jar, req, ctx, flushAfter, asSession } from "../helpers/next";
import { db } from "@/lib/db";
import { setAiProvider } from "@/lib/ai/registry";
import { UnconfiguredProvider } from "@/lib/ai/providers/unconfigured";
import { AppError } from "@/lib/errors";
import { resetRateLimits } from "@/lib/security/rate-limit";
import type { AiProvider } from "@/lib/ai/types";
import * as register from "@/app/api/auth/register/route";
import * as login from "@/app/api/auth/login/route";
import * as me from "@/app/api/me/route";
import * as meExport from "@/app/api/me/export/route";
import * as places from "@/app/api/places/route";
import * as locations from "@/app/api/locations/route";
import * as photos from "@/app/api/photos/route";
import * as photo from "@/app/api/photos/[id]/route";
import * as analyses from "@/app/api/analyses/route";
import * as analysis from "@/app/api/analyses/[id]/route";
import * as plants from "@/app/api/plants/route";
import * as plant from "@/app/api/plants/[id]/route";
import * as plantEvents from "@/app/api/plants/[id]/events/route";
import * as journal from "@/app/api/plants/[id]/journal/route";
import * as reminders from "@/app/api/reminders/route";
import * as reminderDone from "@/app/api/reminders/[id]/done/route";
import * as sowNow from "@/app/api/sowing/now/route";
import * as exportCal from "@/app/api/export/calendar/route";
import * as exportRem from "@/app/api/export/reminders/route";
import * as plantSheet from "@/app/api/export/plant-sheet/route";
import * as designs from "@/app/api/designs/route";
import * as design from "@/app/api/designs/[id]/route";
import * as revise from "@/app/api/designs/[id]/revise/route";
import * as shopping from "@/app/api/export/shopping-list/route";
import * as chat from "@/app/api/chat/route";
import * as search from "@/app/api/search/route";

const json = async (r: Response) => ({ status: r.status, body: await r.json() });

async function signUp(email: string) {
  asSession(undefined);
  const r = await register.POST(req("POST", "/api/auth/register", { email, password: "contraseña-segura-1", acceptTerms: true, imageConsent: true }), {});
  expect(r.status).toBe(201);
  return jar.get("bx_session")!;
}

async function leafJpeg(withGps = false) {
  // Imagen sintética (DATOS DE PRUEBA): rectángulo verde con «nervios».
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#f4efe2"/><ellipse cx="320" cy="240" rx="220" ry="140" fill="#2f6b3a"/><path d="M110 240 H530" stroke="#9bc49a" stroke-width="6"/></svg>`);
  let img = sharp(svg).jpeg();
  if (withGps) img = img.withExif({ IFD0: { Copyright: "test" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "40/1 25/1 0/1" } });
  return img.toBuffer();
}

async function upload(buf: Buffer, name = "a.jpg") {
  const fd = new FormData();
  fd.append("files", new Blob([new Uint8Array(buf)], { type: "image/jpeg" }), name);
  return photos.POST(req("POST", "/api/photos", fd), {});
}

let alice = "";
let bob = "";

beforeAll(async () => {
  resetRateLimits();
  await db.$executeRawUnsafe(`TRUNCATE "User", "Taxon", "ClimateCache", "DataSource", "Crop", "PestDisease" CASCADE`);
  alice = await signUp("alice@test.botanix");
  bob = await signUp("bob@test.botanix");
});

describe("cuenta y sesión", () => {
  it("rechaza registros duplicados y contraseñas cortas", async () => {
    asSession(undefined);
    expect((await register.POST(req("POST", "/api/auth/register", { email: "alice@test.botanix", password: "contraseña-segura-1", acceptTerms: true }), {})).status).toBe(409);
    expect((await register.POST(req("POST", "/api/auth/register", { email: "x@test.botanix", password: "corta", acceptTerms: true }), {})).status).toBe(422);
  });
  it("inicia sesión con la contraseña correcta y la rechaza si es incorrecta", async () => {
    asSession(undefined);
    expect((await login.POST(req("POST", "/api/auth/login", { email: "alice@test.botanix", password: "mal" }), {})).status).toBe(401);
    const ok = await login.POST(req("POST", "/api/auth/login", { email: "alice@test.botanix", password: "contraseña-segura-1" }), {});
    expect(ok.status).toBe(200);
    expect(jar.get("bx_session")).toBeTruthy();
    const u = await db.user.findUnique({ where: { email: "alice@test.botanix" } });
    expect(u!.passwordHash).not.toContain("contraseña");
  });
  it("exige sesión en rutas privadas", async () => {
    asSession(undefined);
    expect((await me.GET(req("GET", "/api/me"), {})).status).toBe(401);
  });
  it("bloquea peticiones de otro origen (CSRF)", async () => {
    asSession(alice);
    const r = await me.PATCH(req("PATCH", "/api/me", { name: "x" }, { origin: "https://evil.example" }), {});
    expect(r.status).toBe(403);
  });
});

describe("ubicación, clima y siembra", () => {
  it("busca un lugar, guarda la ubicación con coordenadas redondeadas y calcula qué sembrar", async () => {
    asSession(alice);
    const p = await json(await places.GET(req("GET", "/api/places?q=Madrid"), {}));
    expect(p.body.places[0].name).toBe("Madrid");
    const loc = await json(await locations.POST(req("POST", "/api/locations", { label: "Casa", country: "ES", countryName: "España", city: "Madrid", latitude: 40.41678, longitude: -3.70379, elevationM: 657 }), {}));
    expect(loc.status).toBe(201);
    expect(loc.body.location.latitude).toBe(40.42);
    expect(loc.body.location.isDefault).toBe(true);
    const now = await json(await sowNow.GET(req("GET", "/api/sowing/now?month=5"), {}));
    expect(now.status).toBe(200);
    expect(now.body.month).toBe(5);
    expect(now.body.items.length).toBeGreaterThan(3);
    expect(now.body.normals.isTestFixture).toBe(true);
  });
  it("exporta el calendario en CSV e ICS", async () => {
    asSession(alice);
    const csv = await exportCal.GET(req("GET", "/api/export/calendar?format=csv"), {});
    expect(csv.headers.get("content-type")).toContain("text/csv");
    expect(await csv.text()).toContain("Sembrar");
    const ics = await exportCal.GET(req("GET", "/api/export/calendar?format=ics"), {});
    expect(await ics.text()).toContain("BEGIN:VCALENDAR");
  });
  it("sin ubicación devuelve un error de validación claro", async () => {
    asSession(bob);
    const r = await json(await sowNow.GET(req("GET", "/api/sowing/now"), {}));
    expect(r.status).toBe(422);
    expect(r.body.error.message).toMatch(/ubicación/);
  });
});

describe("fotos", () => {
  it("valida el contenido real y rechaza archivos que no son imágenes", async () => {
    asSession(alice);
    const fd = new FormData();
    fd.append("files", new Blob(["<script>alert(1)</script>"], { type: "image/jpeg" }), "x.jpg");
    expect((await photos.POST(req("POST", "/api/photos", fd), {})).status).toBe(415);
  });
  it("elimina los metadatos EXIF (incluido el GPS) al guardar", async () => {
    asSession(alice);
    const input = await leafJpeg(true);
    expect((await sharp(input).metadata()).exif).toBeDefined();
    const r = await json(await upload(input));
    const stored = await db.photo.findUnique({ where: { id: r.body.photos[0].id } });
    const file = await fs.readFile(path.join(process.env.STORAGE_LOCAL_DIR!, stored!.storageKey));
    expect((await sharp(file).metadata()).exif).toBeUndefined();
    expect(stored!.retainUntil).not.toBeNull();
  });
});

describe("identificación, ficha y planta guardada", () => {
  let analysisId = "";
  let photoId = "";
  it("crea un análisis asíncrono, lo procesa y guarda el taxón", async () => {
    asSession(alice);
    photoId = (await json(await upload(await leafJpeg()))).body.photos[0].id;
    const created = await json(await analyses.POST(req("POST", "/api/analyses", { kind: "IDENTIFY", photoIds: [photoId], context: { setting: "indoor" } }), {}));
    expect(created.status).toBe(202);
    analysisId = created.body.id;
    expect((await db.analysis.findUnique({ where: { id: analysisId } }))!.status).toBe("PENDING");
    await flushAfter();
    const a = await json(await analysis.GET(req("GET", `/api/analyses/${analysisId}`), ctx(analysisId)));
    expect(a.body.analysis.status).toBe("COMPLETED");
    expect(a.body.analysis.isTestFixture).toBe(true);
    expect(a.body.analysis.result.identification.candidates[0].scientific_name).toBe("Monstera deliciosa");
    expect(a.body.analysis.warnings.join(" ")).toMatch(/tóxica/);
    expect(await db.taxon.findFirst({ where: { scientificName: "Monstera deliciosa" } })).not.toBeNull();
    expect(await db.aiUsage.count({ where: { analysisId } })).toBe(1);
  });
  it("reutiliza un análisis idéntico reciente sin volver a llamar a la IA", async () => {
    asSession(alice);
    const again = await json(await analyses.POST(req("POST", "/api/analyses", { kind: "IDENTIFY", photoIds: [photoId], context: { setting: "indoor" } }), {}));
    expect(again.body.cached).toBe(true);
    expect(again.body.id).toBe(analysisId);
  });
  it("exporta la ficha botánica", async () => {
    asSession(alice);
    const r = await plantSheet.GET(req("GET", `/api/export/plant-sheet?analysisId=${analysisId}`), {});
    expect(await r.text()).toContain("Monstera deliciosa");
  });
  it("guarda la planta, registra cuidados, diario y recordatorios adaptados", async () => {
    asSession(alice);
    const p = await json(await plants.POST(req("POST", "/api/plants", { nickname: "Monstera del salón", scientificName: "Monstera deliciosa", sourceAnalysisId: analysisId, coverPhotoId: photoId }), {}));
    expect(p.status).toBe(201);
    const id = p.body.plant.id;
    expect(p.body.plant.taxonId).toBeTruthy();
    expect((await db.photo.findUnique({ where: { id: photoId } }))!.retainUntil).toBeNull();
    expect((await plantEvents.POST(req("POST", `/api/plants/${id}/events`, { type: "GERMINATION", date: "2026-03-01" }), ctx(id))).status).toBe(201);
    expect((await db.userPlant.findUnique({ where: { id } }))!.germinatedAt).not.toBeNull();
    const jp = (await json(await upload(await leafJpeg()))).body.photos[0].id;
    expect((await journal.POST(req("POST", `/api/plants/${id}/journal`, { title: "Hoja nueva", heightCm: 42, photoIds: [jp] }), ctx(id))).status).toBe(201);
    const r = await json(await reminders.POST(req("POST", "/api/reminders", { type: "WATERING", title: "Regar", intervalDays: 10, userPlantId: id }), {}));
    const done = await json(await reminderDone.POST(req("POST", `/api/reminders/${r.body.reminder.id}/done`), ctx(r.body.reminder.id)));
    expect(done.status).toBe(200);
    expect(await db.careEvent.count({ where: { userPlantId: id, type: "WATERING" } })).toBe(1);
    const ics = await exportRem.GET(req("GET", "/api/export/reminders"), {});
    expect(await ics.text()).toContain("RRULE:FREQ=DAILY;INTERVAL=10");
  });
});

describe("aislamiento de datos entre usuarios", () => {
  it("Bob no puede ver ni modificar análisis, fotos ni plantas de Alice", async () => {
    asSession(alice);
    const a = await db.analysis.findFirst({ where: { user: { email: "alice@test.botanix" } } });
    const ph = await db.photo.findFirst({ where: { user: { email: "alice@test.botanix" } } });
    const pl = await db.userPlant.findFirst({ where: { user: { email: "alice@test.botanix" } } });
    asSession(bob);
    expect((await analysis.GET(req("GET", "/"), ctx(a!.id))).status).toBe(404);
    expect((await photo.GET(req("GET", "/"), ctx(ph!.id))).status).toBe(404);
    expect((await plant.GET(req("GET", "/"), ctx(pl!.id))).status).toBe(404);
    expect((await plant.PATCH(req("PATCH", "/", { status: "dead" }), ctx(pl!.id))).status).toBe(404);
    expect((await plant.DELETE(req("DELETE", "/"), ctx(pl!.id))).status).toBe(404);
    expect((await plantSheet.GET(req("GET", `/api/export/plant-sheet?analysisId=${a!.id}`), {})).status).toBe(404);
    const steal = await analyses.POST(req("POST", "/api/analyses", { kind: "DIAGNOSE", photoIds: [ph!.id] }), {});
    expect(steal.status).toBe(404);
    const list = await json(await plants.GET(req("GET", "/api/plants"), {}));
    expect(list.body.plants).toHaveLength(0);
    expect((await db.userPlant.findUnique({ where: { id: pl!.id } }))!.status).not.toBe("dead");
  });
});

describe("diagnóstico", () => {
  it("devuelve un diagnóstico orientativo y crea su registro", async () => {
    asSession(alice);
    const ph = (await json(await upload(await leafJpeg()))).body.photos[0].id;
    const r = await json(await analyses.POST(req("POST", "/api/analyses", { kind: "DIAGNOSE", photoIds: [ph], context: { watering: "cada 2 días" } }), {}));
    await flushAfter();
    const a = await db.analysis.findUnique({ where: { id: r.body.id }, include: { diagnosis: true } });
    expect(a!.status).toBe("COMPLETED");
    expect((a!.result as { diagnosis: { diagnosis_type: string } }).diagnosis.diagnosis_type).toBe("visual_orientative");
    expect(a!.diagnosis!.confirmation).toBe("visual_orientative");
    expect(a!.warnings.join(" ")).toMatch(/autorizado/);
  });
});

describe("fallos de proveedores", () => {
  it("sin IA configurada responde 503 con instrucciones y no crea análisis", async () => {
    asSession(alice);
    setAiProvider(new UnconfiguredProvider());
    const before = await db.analysis.count();
    const ph = (await json(await upload(await leafJpeg()))).body.photos[0].id;
    const r = await json(await analyses.POST(req("POST", "/api/analyses", { kind: "IDENTIFY", photoIds: [ph] }), {}));
    expect(r.status).toBe(503);
    expect(r.body.error.code).toBe("AI_NOT_CONFIGURED");
    expect(r.body.error.details.help.length).toBe(3);
    expect(await db.analysis.count()).toBe(before);
    expect((await json(await chat.POST(req("POST", "/api/chat", { message: "hola" }), {}))).status).toBe(503);
    setAiProvider(null);
  });
  it("un error del proveedor marca el análisis como fallido con un mensaje útil", async () => {
    asSession(alice);
    const failing: AiProvider = { id: "broken", isConfigured: () => true, structured: async () => { throw new AppError("AI_PROVIDER_ERROR", "No se pudo conectar con el proveedor de IA (tiempo agotado o red)."); }, chat: async () => { throw new Error("x"); } };
    setAiProvider(failing);
    const ph = (await json(await upload(await leafJpeg()))).body.photos[0].id;
    const r = await json(await analyses.POST(req("POST", "/api/analyses", { kind: "IDENTIFY", photoIds: [ph], context: { notes: "otro" } }), {}));
    await flushAfter();
    const a = await db.analysis.findUnique({ where: { id: r.body.id } });
    expect(a!.status).toBe("FAILED");
    expect(a!.errorCode).toBe("AI_PROVIDER_ERROR");
    expect(a!.errorMessage).toMatch(/proveedor/);
    setAiProvider(null);
  });
  it("respeta el límite del plan gratuito", async () => {
    asSession(bob);
    const u = await db.user.findUnique({ where: { email: "bob@test.botanix" } });
    await db.analysis.createMany({ data: Array.from({ length: 10 }, (_, i) => ({ userId: u!.id, kind: "IDENTIFY" as const, status: "COMPLETED" as const, promptVersion: "t", inputHash: `h${i}` })) });
    const ph = (await json(await upload(await leafJpeg()))).body.photos[0].id;
    const r = await json(await analyses.POST(req("POST", "/api/analyses", { kind: "IDENTIFY", photoIds: [ph] }), {}));
    expect(r.status).toBe(402);
    expect(r.body.error.code).toBe("PLAN_LIMIT");
  });
});

describe("diseño de jardín", () => {
  it("genera un diseño, una revisión iterativa y la lista de compra", async () => {
    asSession(alice);
    const ph = (await json(await upload(await leafJpeg()))).body.photos[0].id;
    const created = await json(await designs.POST(req("POST", "/api/designs", { title: "Patio", style: "recommend", photoIds: [ph], inputs: { widthM: 8, depthM: 5, orientation: "S", currency: "EUR" } }), {}));
    expect(created.status).toBe(202);
    await flushAfter();
    const d = await json(await design.GET(req("GET", "/"), ctx(created.body.designId)));
    expect(d.body.design.versions).toHaveLength(1);
    const v1 = d.body.design.versions[0];
    expect(v1.isTestFixture).toBe(true);
    const rev = await revise.POST(req("POST", "/", { changeRequest: "Añade un huerto de 2 × 3 m", fromVersionId: v1.id }), ctx(created.body.designId));
    expect(rev.status).toBe(202);
    await flushAfter();
    const d2 = await json(await design.GET(req("GET", "/"), ctx(created.body.designId)));
    expect(d2.body.design.versions[0].version).toBe(2);
    expect(d2.body.design.versions[0].changeRequest).toMatch(/huerto/);
    const csv = await (await shopping.GET(req("GET", `/api/export/shopping-list?versionId=${v1.id}`), {})).text();
    expect(csv).toContain("Lavanda");
    expect(csv).toContain("orientativas");
  });
});

describe("asistente y búsqueda", () => {
  it("conversa recordando el historial", async () => {
    asSession(alice);
    const r1 = await json(await chat.POST(req("POST", "/api/chat", { message: "¿Cuándo trasplanto mi monstera?" }), {}));
    expect(r1.body.isTestFixture).toBe(true);
    await chat.POST(req("POST", "/api/chat", { conversationId: r1.body.conversationId, message: "¿Y el sustrato?" }), {});
    expect(await db.chatMessage.count({ where: { conversationId: r1.body.conversationId } })).toBe(4);
  });
  it("busca por nombre, familia y característica", async () => {
    asSession(alice);
    const r = await json(await search.GET(req("GET", "/api/search?q=Araceae"), {}));
    expect(r.body.taxa.some((t: { scientificName: string }) => t.scientificName === "Monstera deliciosa")).toBe(true);
    const shade = await json(await search.GET(req("GET", "/api/search?q=sombra"), {}));
    expect(shade.body.crops.length).toBeGreaterThan(0);
  });
});

describe("RGPD", () => {
  it("exporta los datos sin el hash de la contraseña y elimina la cuenta con sus fotos", async () => {
    asSession(alice);
    const exp = await (await meExport.GET(req("GET", "/api/me/export"), {})).text();
    expect(exp).toContain("alice@test.botanix");
    expect(exp).not.toContain("passwordHash");
    const keys = (await db.photo.findMany({ where: { user: { email: "alice@test.botanix" } } })).map((p) => p.storageKey);
    expect(keys.length).toBeGreaterThan(0);
    expect((await me.DELETE(req("DELETE", "/api/me"), {})).status).toBe(200);
    expect(await db.user.findUnique({ where: { email: "alice@test.botanix" } })).toBeNull();
    expect(await db.photo.count({ where: { storageKey: { in: keys } } })).toBe(0);
    for (const k of keys) await expect(fs.access(path.join(process.env.STORAGE_LOCAL_DIR!, k))).rejects.toThrow();
  });
});

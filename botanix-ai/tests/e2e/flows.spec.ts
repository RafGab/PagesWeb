import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

// Flujos críticos en navegador real. La IA y el clima son proveedores de DATOS DE PRUEBA:
// se comprueba además que la interfaz lo indica de forma visible.
const IMG = path.join(__dirname, "../fixtures/leaf-test.jpg");
const unique = () => `e2e-${Date.now()}-${Math.round(Math.random() * 1e6)}@test.botanix`;

async function register(page: Page) {
  await page.goto("/register");
  await page.getByLabel("Correo electrónico").fill(unique());
  await page.getByLabel("Contraseña").fill("contraseña-e2e-segura");
  await page.getByText("Acepto las condiciones").click();
  await page.getByText("Autorizo procesar mis fotos").click();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/profile\?welcome=1/);
}

async function addLocation(page: Page) {
  await page.getByPlaceholder("Busca tu ciudad o municipio").fill("Madrid");
  await page.getByRole("button", { name: /Buscar/ }).click();
  await page.getByRole("button", { name: /Madrid/ }).first().click();
  await page.getByRole("button", { name: "Guardar" }).first().click();
  await expect(page.getByText("Comunidad de Madrid").first()).toBeVisible();
}

test("registro → ubicación → identificar → ficha → guardar planta → recordatorio", async ({ page }) => {
  await register(page);
  await addLocation(page);

  await page.goto("/identify");
  await page.locator('input[type="file"][multiple]').setInputFiles(IMG);
  const submit = page.getByRole("button", { name: "Identificar", exact: true });
  await expect(submit).toBeEnabled({ timeout: 15_000 });
  await submit.click();
  await expect(page).toHaveURL(/\/analyses\//);
  await expect(page.getByText("DATOS DE PRUEBA").first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Monstera deliciosa").first()).toBeVisible();
  await expect(page.getByText("Especies candidatas")).toBeVisible();
  await expect(page.getByText(/no una probabilidad científica calibrada/)).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: /Descargar/ }).click();
  expect((await download).suggestedFilename()).toMatch(/^ficha-monstera-deliciosa\.md$/);

  await page.getByRole("button", { name: "Guardar en mis plantas" }).click();
  await expect(page).toHaveURL(/\/plants\//);
  await page.getByLabel(/Cada \(días\)/).fill("5");
  await page.getByPlaceholder("Nuevo recordatorio").fill("Regar la monstera");
  await page.getByRole("button", { name: "Añadir" }).nth(1).click();
  await expect(page.getByText("Regar la monstera")).toBeVisible();

  await page.goto("/calendar");
  await expect(page.getByText("Regar la monstera")).toBeVisible();
  await page.getByRole("button", { name: "Hecho" }).click();

  await page.goto("/history");
  await expect(page.getByText("Monstera deliciosa")).toBeVisible();
});

test("diagnóstico orientativo con aviso y sin dosis", async ({ page }) => {
  await register(page);
  await page.goto("/diagnose");
  await page.locator('input[type="file"][multiple]').setInputFiles(IMG);
  await page.getByLabel(/¿Cada cuánto riegas\?/).fill("Cada dos días");
  const submit = page.getByRole("button", { name: "Diagnosticar", exact: true });
  await expect(submit).toBeEnabled({ timeout: 15_000 });
  await submit.click();
  await expect(page.getByText("Oídio (posible)")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Diagnóstico visual orientativo/).first()).toBeVisible();
  await expect(page.getByText(/Plan de recuperación/)).toBeVisible();
});

test("qué sembrar: recomendaciones, clima y calendario exportable", async ({ page }) => {
  await register(page);
  await addLocation(page);
  await page.goto("/sow");
  await expect(page.getByText("Tu clima")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("radio", { name: "May" }).click();
  await page.getByRole("button", { name: /Ver más \(\d+\)/ }).click();
  await expect(page.getByText("Tomate", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Frutales y perennes")).toBeVisible();
  await expect(page.getByText("DATOS DE PRUEBA").first()).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Exportar CSV" }).click();
  expect((await download).suggestedFilename()).toBe("botanix-calendario.csv");
});

test("diseño de jardín: propuesta, plano, presupuesto y revisión", async ({ page }) => {
  await register(page);
  await page.goto("/design");
  await page.getByLabel("Ancho (m)").fill("8");
  await page.getByLabel("Fondo (m)").fill("5");
  await page.getByRole("button", { name: "Generar propuestas" }).click();
  await expect(page).toHaveURL(/\/design\//);
  await expect(page.getByText("Patio mediterráneo de bajo consumo")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("img", { name: "Plano esquemático del jardín" })).toBeVisible();
  await expect(page.getByText(/no son precios actuales/).first()).toBeVisible();
  await page.getByLabel("Pedir cambios").fill("Añade un huerto pequeño");
  await page.getByRole("button", { name: "Pedir cambios" }).click();
  await expect(page.getByRole("link", { name: /v2/ })).toBeVisible({ timeout: 20_000 });
});

test("las páginas privadas exigen sesión y la portada es accesible", async ({ page }) => {
  await page.goto("/plants");
  await expect(page).toHaveURL(/\/login\?next=%2Fplants/);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});

import { defineConfig, devices } from "@playwright/test";

// E2E contra el build de producción con proveedores de DATOS DE PRUEBA (IA y clima simulados,
// claramente marcados en la interfaz). Requiere una base de datos dedicada: E2E_DATABASE_URL.
const DB = process.env.E2E_DATABASE_URL ?? "postgresql://botanix:botanix@localhost:5432/botanix_e2e?schema=public";
const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-ES",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : undefined,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      DATABASE_URL: DB,
      APP_URL: `http://localhost:${PORT}`,
      AI_PROVIDER: "fixture",
      CLIMATE_PROVIDER: "fixture",
      BOTANIX_ALLOW_FIXTURES: "1",
      STORAGE_LOCAL_DIR: "./storage-e2e",
      RATE_LIMIT_REGISTER_PER_HOUR: "100",
    },
  },
});

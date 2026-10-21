import "server-only";
import { z } from "zod";

// Configuración del servidor validada una sola vez. Nada de aquí llega al navegador.
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().url().default("http://localhost:3000"),
  AI_PROVIDER: z.enum(["openai", "anthropic", "fixture", "none"]).default("openai"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-opus-5-5"),
  ANTHROPIC_EFFORT: z.enum(["low", "medium", "high", "xhigh", "max"]).default("medium"),
  ANTHROPIC_SERVER_FALLBACK: z.enum(["0", "1"]).default("1"),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(120_000),
  CLIMATE_PROVIDER: z.enum(["open-meteo", "fixture"]).default("open-meteo"),
  TAXONOMY_PROVIDER: z.enum(["gbif", "none"]).default("gbif"),
  STORAGE_DRIVER: z.enum(["local"]).default("local"),
  STORAGE_LOCAL_DIR: z.string().default("./storage"),
  IMAGE_RETENTION_DAYS: z.coerce.number().int().positive().default(30),
  MAX_UPLOAD_MB: z.coerce.number().positive().max(25).default(12),
  SESSION_DAYS: z.coerce.number().int().positive().max(365).default(30),
  RATE_LIMIT_REGISTER_PER_HOUR: z.coerce.number().int().positive().default(5),
  // Solo para pruebas automatizadas: habilita proveedores de datos de prueba.
  BOTANIX_ALLOW_FIXTURES: z.enum(["0", "1"]).default("0"),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  // En Render, la URL pública llega en RENDER_EXTERNAL_URL si no se define APP_URL.
  const parsed = EnvSchema.safeParse({ ...process.env, APP_URL: process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || undefined });
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Configuración inválida en variables de entorno: ${fields}`);
  }
  const e = parsed.data;
  const fixturesAllowed = e.NODE_ENV === "test" || e.BOTANIX_ALLOW_FIXTURES === "1";
  if (!fixturesAllowed && (e.AI_PROVIDER === "fixture" || e.CLIMATE_PROVIDER === "fixture")) {
    throw new Error("Los proveedores 'fixture' solo se permiten en pruebas (BOTANIX_ALLOW_FIXTURES=1).");
  }
  cached = e;
  return e;
}

export function resetEnvCache() {
  cached = null;
}

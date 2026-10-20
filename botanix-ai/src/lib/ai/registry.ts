import "server-only";
import { env } from "@/lib/env";
import { AnthropicProvider } from "./providers/anthropic";
import { FixtureProvider } from "./providers/fixture";
import { UnconfiguredProvider } from "./providers/unconfigured";
import type { AiProvider } from "./types";

let override: AiProvider | null = null;
let cached: AiProvider | null = null;

/** Devuelve el proveedor configurado. Añadir otro proveedor = una clase que implemente AiProvider. */
export function aiProvider(): AiProvider {
  if (override) return override;
  if (cached) return cached;
  const e = env();
  if (e.AI_PROVIDER === "fixture") cached = new FixtureProvider();
  else if (e.AI_PROVIDER === "anthropic" && e.ANTHROPIC_API_KEY)
    cached = new AnthropicProvider({
      apiKey: e.ANTHROPIC_API_KEY,
      model: e.ANTHROPIC_MODEL,
      effort: e.ANTHROPIC_EFFORT,
      serverFallback: e.ANTHROPIC_SERVER_FALLBACK === "1",
      timeoutMs: e.AI_TIMEOUT_MS,
    });
  else cached = new UnconfiguredProvider();
  return cached;
}

/** Solo para pruebas. */
export function setAiProvider(p: AiProvider | null) {
  override = p;
  cached = null;
}

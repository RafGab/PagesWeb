// Tarifas por millón de tokens (USD) de la API de Anthropic según la tabla oficial de modelos
// vigente el 06/10/2026. Revisar https://platform.claude.com/docs/en/about-claude/pricing antes
// de presupuestar; si cambian, actualizar aquí (el coste se recalcula en cada operación).
export const PRICING_VERIFIED_AT = "2026-10-06";

// cacheRead: null cuando no se ha verificado la tarifa de lectura de caché; en ese caso se cobra
// a precio de entrada (cota superior) en lugar de suponer un descuento.
export const PRICES: Record<string, { input: number; output: number; cacheRead: number | null }> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: null },
  "claude-fable-5-1": { input: 10, output: 50, cacheRead: 0.25 },
  "claude-opus-5": { input: 5, output: 25, cacheRead: null },
  "claude-opus-4-8": { input: 5, output: 25, cacheRead: null },
  // OpenAI: tarifas públicas conocidas de estos modelos. No se han podido comprobar en vivo desde
  // el entorno de desarrollo: confirmar en https://openai.com/api/pricing antes de presupuestar.
  "gpt-4o-mini": { input: 0.15, output: 0.6, cacheRead: 0.075 },
  "gpt-4o": { input: 2.5, output: 10, cacheRead: 1.25 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6, cacheRead: 0.1 },
  "gpt-4.1": { input: 2, output: 8, cacheRead: 0.5 },
};

/** Coste en USD. Devuelve null si el modelo no está en la tabla (no se inventa una tarifa). */
export function costUsd(model: string, inputTokens: number, outputTokens: number, cacheReadTokens = 0): number | null {
  // La clave más larga que encaje: «gpt-4o-mini-2024-07-18» debe usar gpt-4o-mini, no gpt-4o.
  const key = Object.keys(PRICES)
    .filter((k) => model === k || model.startsWith(`${k}-`))
    .sort((a, b) => b.length - a.length)[0];
  if (!key) return null;
  const p = PRICES[key];
  return (inputTokens * p.input + outputTokens * p.output + cacheReadTokens * (p.cacheRead ?? p.input)) / 1_000_000;
}

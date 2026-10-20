import { describe, expect, it } from "vitest";
import { OpenAiProvider } from "@/lib/ai/providers/openai";
import { IdentificationSchema } from "@/lib/domain/identification";
import { FIXTURE_IDENTIFICATION } from "@/lib/ai/providers/fixture";

// Respuestas simuladas de la Responses API (no hay red ni clave real en las pruebas).
function fakeFetch(body: unknown, status = 200, capture?: { body?: Record<string, unknown>; url?: string }) {
  return (async (url: string | URL | Request, init?: RequestInit) => {
    if (capture) {
      capture.url = String(url);
      capture.body = JSON.parse(String(init?.body));
    }
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
}

const message = (content: unknown[]) => ({
  id: "resp_test", object: "response", created_at: 0, status: "completed", model: "gpt-4o-mini-2024-07-18",
  output: [{ id: "msg_1", type: "message", role: "assistant", status: "completed", content }],
  usage: { input_tokens: 3000, output_tokens: 1200, input_tokens_details: { cached_tokens: 1000 }, output_tokens_details: { reasoning_tokens: 0 }, total_tokens: 4200 },
});

const provider = (f: typeof fetch) => new OpenAiProvider({ apiKey: "sk-test", model: "gpt-4o-mini", timeoutMs: 5000, fetch: f });
const req = { task: "identify" as const, system: "sys", userText: "Identifica", images: [{ mediaType: "image/jpeg" as const, base64: "QUJD" }], schema: IdentificationSchema, maxTokens: 8000 };

describe("adaptador OpenAI", () => {
  it("envía la foto y el esquema estricto, y valida la respuesta estructurada", async () => {
    const cap: { body?: Record<string, unknown>; url?: string } = {};
    const r = await provider(fakeFetch(message([{ type: "output_text", text: JSON.stringify(FIXTURE_IDENTIFICATION), annotations: [] }]), 200, cap)).structured(req);
    expect(cap.url).toContain("/responses");
    const input = (cap.body!.input as { content: { type: string; image_url?: string }[] }[])[0].content;
    expect(input[0]).toMatchObject({ type: "input_image", image_url: "data:image/jpeg;base64,QUJD" });
    expect((cap.body!.text as { format: { type: string; strict: boolean } }).format).toMatchObject({ type: "json_schema", strict: true });
    expect(r.data.candidates[0].scientific_name).toBe("Monstera deliciosa");
    expect(r.usage).toEqual({ provider: "openai", model: "gpt-4o-mini-2024-07-18", inputTokens: 2000, outputTokens: 1200, cacheReadTokens: 1000 });
    expect(r.isTestFixture).toBe(false);
  });
  it("convierte un rechazo del modelo en un error claro", async () => {
    await expect(provider(fakeFetch(message([{ type: "refusal", refusal: "No puedo ayudar" }]))).structured(req)).rejects.toMatchObject({ code: "AI_REFUSED" });
  });
  it("una clave inválida se trata como IA no configurada", async () => {
    await expect(provider(fakeFetch({ error: { message: "Incorrect API key", type: "invalid_request_error" } }, 401)).structured(req)).rejects.toMatchObject({ code: "AI_NOT_CONFIGURED" });
  });
  it("saldo agotado o límite de OpenAI se informa sin romper la app", async () => {
    await expect(provider(fakeFetch({ error: { message: "quota", type: "insufficient_quota" } }, 429)).chat({ system: "s", messages: [{ role: "user", content: "hola" }], maxTokens: 100 })).rejects.toMatchObject({ code: "RATE_LIMITED" });
  });
  it("chat devuelve el texto de la respuesta", async () => {
    const r = await provider(fakeFetch(message([{ type: "output_text", text: "Riega cuando el sustrato esté seco.", annotations: [] }]))).chat({ system: "s", messages: [{ role: "user", content: "¿Cuándo riego?" }], maxTokens: 100 });
    expect(r.text).toBe("Riega cuando el sustrato esté seco.");
  });
  it("sin clave no está configurado", () => {
    expect(new OpenAiProvider({ model: "gpt-4o-mini", timeoutMs: 1000 }).isConfigured()).toBe(false);
  });
});

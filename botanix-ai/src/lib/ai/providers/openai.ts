import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { AppError } from "@/lib/errors";
import type { AiProvider, ChatRequest, ChatResult, StructuredRequest, StructuredResult } from "../types";

export interface OpenAiConfig {
  apiKey?: string;
  model: string;
  timeoutMs: number;
  /** Solo para pruebas: sustituye el transporte HTTP. */
  fetch?: typeof fetch;
}

/**
 * Adaptador para la API de OpenAI (Responses API) con salidas estructuradas validadas con zod.
 * Usa la misma variable OPENAI_API_KEY que el agente virtual de AI Lead Machine.
 */
export class OpenAiProvider implements AiProvider {
  readonly id = "openai";
  private client: OpenAI | null = null;

  constructor(private cfg: OpenAiConfig) {}

  isConfigured() {
    return Boolean(this.cfg.apiKey);
  }

  private getClient() {
    if (!this.cfg.apiKey) throw new AppError("AI_NOT_CONFIGURED", "Falta OPENAI_API_KEY.");
    this.client ??= new OpenAI({ apiKey: this.cfg.apiKey, maxRetries: this.cfg.fetch ? 0 : 2, timeout: this.cfg.timeoutMs, ...(this.cfg.fetch ? { fetch: this.cfg.fetch } : {}) });
    return this.client;
  }

  async structured<T>(req: StructuredRequest<T>): Promise<StructuredResult<T>> {
    try {
      const response = await this.getClient().responses.parse({
        model: this.cfg.model,
        instructions: req.system,
        max_output_tokens: req.maxTokens,
        input: [
          {
            role: "user",
            content: [
              ...req.images.map((img) => ({ type: "input_image" as const, detail: "high" as const, image_url: `data:${img.mediaType};base64,${img.base64}` })),
              { type: "input_text" as const, text: req.userText },
            ],
          },
        ],
        text: { format: zodTextFormat(req.schema, req.task) },
      });
      if (hasRefusal(response.output)) {
        throw new AppError("AI_REFUSED", "El modelo no ha podido procesar esta petición. Prueba con otra foto o reformula el contexto.");
      }
      if (response.status === "incomplete") {
        throw new AppError("AI_INVALID_OUTPUT", "La respuesta del modelo quedó incompleta. Inténtalo de nuevo.");
      }
      if (!response.output_parsed) throw new AppError("AI_INVALID_OUTPUT", "La respuesta del modelo no tiene el formato esperado.");
      return { data: response.output_parsed as T, usage: usageOf(this.id, response), isTestFixture: false };
    } catch (err) {
      throw mapError(err);
    }
  }

  async chat(req: ChatRequest): Promise<ChatResult> {
    try {
      const response = await this.getClient().responses.create({
        model: this.cfg.model,
        instructions: req.system,
        max_output_tokens: req.maxTokens,
        input: req.messages.map((m) => ({ role: m.role, content: m.content })),
      });
      if (hasRefusal(response.output)) throw new AppError("AI_REFUSED", "El asistente no puede responder a esta consulta.");
      return { text: response.output_text.trim(), usage: usageOf(this.id, response), isTestFixture: false };
    } catch (err) {
      throw mapError(err);
    }
  }
}

type AnyResponse = { model: string; usage?: { input_tokens: number; output_tokens: number; input_tokens_details?: { cached_tokens?: number } } | null };

// Tokens de entrada facturables = entrada total − leídos de caché (que se cobran aparte).
function usageOf(provider: string, r: AnyResponse) {
  const cached = r.usage?.input_tokens_details?.cached_tokens ?? 0;
  return {
    provider,
    model: r.model,
    inputTokens: (r.usage?.input_tokens ?? 0) - cached,
    outputTokens: r.usage?.output_tokens ?? 0,
    cacheReadTokens: cached,
  };
}

function hasRefusal(output: unknown): boolean {
  if (!Array.isArray(output)) return false;
  return output.some((item) => item?.type === "message" && Array.isArray(item.content) && item.content.some((c: { type?: string }) => c?.type === "refusal"));
}

function mapError(err: unknown): unknown {
  if (err instanceof AppError) return err;
  if (err instanceof OpenAI.AuthenticationError || err instanceof OpenAI.PermissionDeniedError) {
    return new AppError("AI_NOT_CONFIGURED", "La clave de OpenAI no es válida o no tiene permisos.");
  }
  if (err instanceof OpenAI.RateLimitError) return new AppError("RATE_LIMITED", "OpenAI está saturado o se ha agotado el saldo de la cuenta. Inténtalo más tarde.");
  if (err instanceof OpenAI.BadRequestError) return new AppError("AI_PROVIDER_ERROR", "OpenAI rechazó la petición (revisa que el modelo admita imágenes y salidas estructuradas).");
  if (err instanceof OpenAI.APIConnectionError) return new AppError("AI_PROVIDER_ERROR", "No se pudo conectar con OpenAI (tiempo agotado o red).");
  if (err instanceof OpenAI.APIError) return new AppError("AI_PROVIDER_ERROR", `Error de OpenAI (${err.status ?? "sin código"}).`);
  return err;
}

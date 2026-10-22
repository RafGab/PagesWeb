import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { AppError } from "@/lib/errors";
import type { AiProvider, ChatRequest, ChatResult, StructuredRequest, StructuredResult } from "../types";

export interface AnthropicConfig {
  apiKey?: string;
  model: string;
  effort: "low" | "medium" | "high" | "xhigh" | "max";
  serverFallback: boolean;
  timeoutMs: number;
}

/**
 * Adaptador para la API de Claude. Usa salidas estructuradas validadas con zod y, si está
 * activado, los fallbacks del servidor: si el modelo rechaza una petición por sus filtros de
 * seguridad, la API la reintenta en el modelo alternativo recomendado dentro de la misma llamada.
 */
export class AnthropicProvider implements AiProvider {
  readonly id = "anthropic";
  private client: Anthropic | null = null;

  constructor(private cfg: AnthropicConfig) {}

  isConfigured() {
    return Boolean(this.cfg.apiKey);
  }

  private getClient() {
    if (!this.cfg.apiKey) throw new AppError("AI_NOT_CONFIGURED", "Falta ANTHROPIC_API_KEY.");
    this.client ??= new Anthropic({ apiKey: this.cfg.apiKey, maxRetries: 2, timeout: this.cfg.timeoutMs });
    return this.client;
  }

  private fallbackParams() {
    return this.cfg.serverFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {};
  }

  async structured<T>(req: StructuredRequest<T>): Promise<StructuredResult<T>> {
    const content: Anthropic.Beta.BetaContentBlockParam[] = [
      ...req.images.map((img) => ({ type: "image" as const, source: { type: "base64" as const, media_type: img.mediaType, data: img.base64 } })),
      { type: "text", text: req.userText },
    ];
    try {
      const response = await this.getClient().beta.messages.parse({
        model: this.cfg.model,
        max_tokens: req.maxTokens,
        system: req.system,
        messages: [{ role: "user", content }],
        output_config: { effort: this.cfg.effort, format: betaZodOutputFormat(req.schema) },
        ...this.fallbackParams(),
      });
      if (response.stop_reason === "refusal") {
        throw new AppError("AI_REFUSED", "El modelo no ha podido procesar esta petición. Prueba con otra foto o reformula el contexto.");
      }
      if (response.stop_reason === "max_tokens") {
        throw new AppError("AI_INVALID_OUTPUT", "La respuesta del modelo quedó incompleta. Inténtalo de nuevo.");
      }
      if (!response.parsed_output) throw new AppError("AI_INVALID_OUTPUT", "La respuesta del modelo no tiene el formato esperado.");
      return {
        data: response.parsed_output as T,
        usage: {
          provider: this.id,
          model: response.model,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
        },
        isTestFixture: false,
      };
    } catch (err) {
      throw mapError(err);
    }
  }

  async chat(req: ChatRequest): Promise<ChatResult> {
    try {
      const response = await this.getClient().beta.messages.create({
        model: this.cfg.model,
        max_tokens: req.maxTokens,
        system: req.system,
        messages: req.messages,
        output_config: { effort: this.cfg.effort },
        ...this.fallbackParams(),
      });
      if (response.stop_reason === "refusal") throw new AppError("AI_REFUSED", "El asistente no puede responder a esta consulta.");
      const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
      return {
        text,
        usage: {
          provider: this.id,
          model: response.model,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
        },
        isTestFixture: false,
      };
    } catch (err) {
      throw mapError(err);
    }
  }
}

function mapError(err: unknown): unknown {
  if (err instanceof AppError) return err;
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return new AppError("AI_NOT_CONFIGURED", "La clave de Anthropic no es válida o no tiene permisos.");
  }
  if (err instanceof Anthropic.RateLimitError) return new AppError("RATE_LIMITED", "El proveedor de IA está saturado. Inténtalo en unos minutos.");
  if (err instanceof Anthropic.BadRequestError) return new AppError("AI_PROVIDER_ERROR", "El proveedor de IA rechazó la petición.");
  if (err instanceof Anthropic.APIConnectionError) return new AppError("AI_PROVIDER_ERROR", "No se pudo conectar con el proveedor de IA (tiempo agotado o red).");
  if (err instanceof Anthropic.APIError) return new AppError("AI_PROVIDER_ERROR", `Error del proveedor de IA (${err.status ?? "sin código"}).`);
  return err;
}

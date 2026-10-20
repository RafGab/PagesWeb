import { AppError } from "@/lib/errors";
import type { AiProvider } from "../types";

/** Se usa cuando no hay proveedor configurado: nunca simula resultados. */
export class UnconfiguredProvider implements AiProvider {
  readonly id = "none";
  isConfigured() {
    return false;
  }
  async structured(): Promise<never> {
    throw notConfigured();
  }
  async chat(): Promise<never> {
    throw notConfigured();
  }
}

export function notConfigured() {
  return new AppError(
    "AI_NOT_CONFIGURED",
    "El análisis con IA no está configurado en este servidor.",
    {
      help: [
        "1. Crea una clave en https://platform.claude.com (sección API keys).",
        "2. Añádela al archivo .env del servidor: ANTHROPIC_API_KEY=\"…\" y AI_PROVIDER=\"anthropic\".",
        "3. Reinicia la aplicación.",
      ],
    },
  );
}

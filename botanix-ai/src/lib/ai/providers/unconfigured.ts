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
        "1. Copia la clave de OpenAI (la misma OPENAI_API_KEY del agente virtual en Render) o crea una en https://platform.openai.com/api-keys.",
        "2. Añádela a las variables de entorno del servidor: OPENAI_API_KEY=\"…\" y AI_PROVIDER=\"openai\".",
        "3. Reinicia la aplicación.",
      ],
    },
  );
}

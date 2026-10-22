import type { ZodType } from "zod";

export type AiTask = "identify" | "diagnose" | "garden_design" | "chat";

export interface AiImage {
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  base64: string;
}

export interface AiUsageInfo {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
}

export interface StructuredRequest<T> {
  task: Exclude<AiTask, "chat">;
  system: string;
  userText: string;
  images: AiImage[];
  schema: ZodType<T>;
  maxTokens: number;
}

export interface StructuredResult<T> {
  data: T;
  usage: AiUsageInfo;
  isTestFixture: boolean;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  system: string;
  messages: ChatTurn[];
  maxTokens: number;
}

export interface ChatResult {
  text: string;
  usage: AiUsageInfo;
  isTestFixture: boolean;
}

/** Contrato que debe cumplir cualquier proveedor de IA multimodal. */
export interface AiProvider {
  readonly id: string;
  isConfigured(): boolean;
  structured<T>(req: StructuredRequest<T>): Promise<StructuredResult<T>>;
  chat(req: ChatRequest): Promise<ChatResult>;
}

// Errores de dominio con código estable para la API y la interfaz.
export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "PLAN_LIMIT"
  | "AI_NOT_CONFIGURED"
  | "AI_PROVIDER_ERROR"
  | "AI_REFUSED"
  | "AI_INVALID_OUTPUT"
  | "UPSTREAM_UNAVAILABLE"
  | "BAD_IMAGE"
  | "CONFLICT"
  | "INTERNAL";

const STATUS: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 422,
  RATE_LIMITED: 429,
  PLAN_LIMIT: 402,
  AI_NOT_CONFIGURED: 503,
  AI_PROVIDER_ERROR: 502,
  AI_REFUSED: 422,
  AI_INVALID_OUTPUT: 502,
  UPSTREAM_UNAVAILABLE: 503,
  BAD_IMAGE: 415,
  CONFLICT: 409,
  INTERNAL: 500,
};

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
  get status() {
    return STATUS[this.code];
  }
}

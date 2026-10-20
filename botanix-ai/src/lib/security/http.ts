import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { rateLimit } from "./rate-limit";
import { env } from "@/lib/env";

export function jsonError(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json({ error: { code: err.code, message: err.message, details: err.details } }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Datos no válidos", details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })) } },
      { status: 422 },
    );
  }
  // Registro sin datos personales ni contenido de fotos: solo tipo y mensaje.
  console.error("[botanix] error interno:", err instanceof Error ? `${err.name}: ${err.message}` : "desconocido");
  return NextResponse.json({ error: { code: "INTERNAL", message: "Error interno" } }, { status: 500 });
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "local").trim();
}

export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const r = rateLimit(key, limit, windowMs);
  if (!r.ok) throw new AppError("RATE_LIMITED", `Demasiadas peticiones. Inténtalo de nuevo en ${r.retryAfterSec} s.`, { retryAfterSec: r.retryAfterSec });
}

// Protección CSRF para peticiones que modifican datos: el origen debe coincidir con la app.
export function assertSameOrigin(req: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const origin = req.headers.get("origin");
  if (!origin) return; // peticiones del mismo origen sin cabecera (algunos navegadores en GET/form) o herramientas de servidor
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AppError("FORBIDDEN", "Origen no válido");
  }
  const appHost = new URL(env().APP_URL).host;
  if (originHost !== host && originHost !== appHost) throw new AppError("FORBIDDEN", "Origen no permitido");
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

export function route<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      assertSameOrigin(req);
      return await handler(req, ctx);
    } catch (err) {
      return jsonError(err);
    }
  };
}

// Simula el contexto de petición de Next.js (cookies y after) para llamar a los route handlers.
import { vi } from "vitest";

export const jar = new Map<string, string>();
export const pending: (() => unknown)[] = [];

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
  headers: async () => new Headers({ "accept-language": "es" }),
}));

vi.mock("next/server", async (orig) => {
  const actual = await orig<typeof import("next/server")>();
  return { ...actual, after: (fn: () => unknown) => void pending.push(fn) };
});

export async function flushAfter() {
  while (pending.length) await pending.shift()!();
}

export function req(method: string, url: string, body?: unknown, headers: Record<string, string> = {}) {
  const init: RequestInit = { method, headers: { ...headers } };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    init.body = JSON.stringify(body);
    (init.headers as Record<string, string>)["content-type"] = "application/json";
  }
  return new Request(`http://localhost:3000${url}`, init);
}

export const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

/** Cambia el usuario «conectado» guardando y restaurando su cookie de sesión. */
export function asSession(token: string | undefined) {
  jar.clear();
  if (token) jar.set("bx_session", token);
}

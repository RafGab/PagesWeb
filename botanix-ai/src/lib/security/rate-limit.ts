// Limitador de ventana deslizante en memoria. Suficiente para una instancia;
// en despliegues con varias réplicas sustituir por Redis (misma interfaz).
type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return { ok: false, remaining: 0, retryAfterSec: Math.ceil((windowMs - (now - oldest)) / 1000) };
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  if (buckets.size > 50_000) pruneOld(now, windowMs);
  return { ok: true, remaining: limit - bucket.hits.length, retryAfterSec: 0 };
}

function pruneOld(now: number, windowMs: number) {
  for (const [k, b] of buckets) if (b.hits.every((t) => now - t >= windowMs)) buckets.delete(k);
}

export function resetRateLimits() {
  buckets.clear();
}

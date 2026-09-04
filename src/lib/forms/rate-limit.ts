import "server-only";

/**
 * In-memory rate limiter for the enquiry endpoint.
 *
 * ---------------------------------------------------------------------
 * KNOWN LIMITATION — read before relying on this.
 *
 * State lives in the process. On Vercel each serverless instance has its
 * own memory, and instances are created and destroyed freely, so this is
 * NOT a distributed limit: a determined attacker spread across instances
 * gets more than the stated allowance.
 *
 * It is still worth having. It stops the common case — one script
 * hammering one endpoint — at effectively zero cost and with no extra
 * infrastructure, and it composes with the honeypot and Zod validation.
 *
 * If enquiry spam becomes a real problem, replace the Map with Upstash
 * Redis or Vercel KV; the exported signature does not need to change.
 * Documented in DEPLOYMENT.md § Abuse protection.
 * ---------------------------------------------------------------------
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PER_WINDOW = 5;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Trims expired buckets so the Map cannot grow without bound. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Identifies the caller from proxy headers. Vercel sets
 * `x-forwarded-for`; the first entry is the client.
 *
 * These headers are spoofable, which is another reason this is a
 * best-effort speed bump rather than a security control.
 */
function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(request: Request): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  sweep(now);

  const key = clientKey(request);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_PER_WINDOW - 1 };
  }

  if (bucket.count >= MAX_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: MAX_PER_WINDOW - bucket.count };
}

/**
 * Per-IP request limiting, in a module-scoped Map.
 *
 * SPEC.md §3 records why this is a Map and not Redis: the container is one
 * long-lived process, so the count is genuinely reliable here. On serverless the
 * same code would be best-effort noise. **It breaks the moment there are two
 * replicas** — §11 Assumption 8 states the single-replica constraint that this
 * depends on, and scaling past it needs a change proposal rather than a config
 * tweak.
 *
 * No React, no DOM — `lib/` per the constitution's dependency direction.
 */

/** AC-023: more than 5 in 60 seconds is refused. */
const LIMIT = 5;
const WINDOW_MS = 60_000;

/** Stop the Map growing without bound on a long-lived process. */
const MAX_KEYS = 10_000;

const hits = new Map<string, number[]>();

/**
 * The client's address, per SPEC.md §6 as amended by proposal 0006.
 *
 * `CF-Connecting-IP` FIRST, and deliberately not `X-Forwarded-For`.
 *
 * This read the first `X-Forwarded-For` entry, on the stated assumption that
 * nginx was the only thing in front — which was true until the site went behind
 * Cloudflare. It is now false in the worst way: Cloudflare **appends** to a
 * caller-supplied `X-Forwarded-For` rather than replacing it, so the first entry
 * is whatever the caller wrote. A limiter keyed on that is not a limiter — every
 * request can carry a fresh address and never reach the ceiling.
 *
 * `CF-Connecting-IP` is a single address that Cloudflare writes itself,
 * overwriting anything the caller sent, so it cannot be forged from outside. It
 * is trustworthy here for one reason and only that reason: the server block
 * `return 403`s any connection that did not come from a Cloudflare range, so
 * nothing else can reach this process to set it. **Remove that gate and this
 * header becomes forgeable again** — the two are a pair, and neither is safe
 * alone.
 *
 * `X-Real-IP` is the second choice: nginx sets it from `$remote_addr`, which
 * the real_ip module has already rewritten from `CF-Connecting-IP`. Same value,
 * one more hop of trust, so it is the fallback rather than the source.
 *
 * `X-Forwarded-For` is not consulted at all. Behind this topology it carries
 * attacker-controlled entries and no information the two headers above lack.
 *
 * The "local" fallback exists for development, where no proxy sets anything. It
 * buckets every caller together — wrong in production, harmless on a laptop, and
 * why deploy/README.md tells you to confirm real addresses arrive.
 */
export function clientKey(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf) {
    const addr = cf.trim();
    if (addr) return addr;
  }

  const real = headers.get("x-real-ip");
  if (real) {
    const addr = real.trim();
    if (addr) return addr;
  }

  return "local";
}

/**
 * Records a hit and reports whether it is over the limit.
 *
 * Sliding window, not a fixed bucket: a fixed 60-second bucket lets 10 requests
 * through across a boundary — five at 0:59 and five at 1:01 — which is twice the
 * limit at the moment it matters most.
 *
 * `now` is a parameter so this is testable without waiting a minute.
 */
export function overLimit(key: string, now: number = Date.now()): boolean {
  const cutoff = now - WINDOW_MS;

  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);
  recent.push(now);
  hits.set(key, recent);

  // Evict cold keys before the Map becomes the memory leak. Cheap because it
  // only runs once the Map is already large.
  if (hits.size > MAX_KEYS) {
    for (const [k, times] of hits) {
      if (times.length === 0 || times[times.length - 1] <= cutoff) hits.delete(k);
    }
  }

  return recent.length > LIMIT;
}

/** Test seam. Never called by the route. */
export function resetRateLimit(): void {
  hits.clear();
}

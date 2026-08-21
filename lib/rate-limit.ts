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
 * The client's address, per SPEC.md §6.
 *
 * `X-Forwarded-For` is a list and the **first** entry is the originating client;
 * later entries are proxies. Taking the last would let anyone set their own key
 * by sending the header themselves, which turns a per-IP limit into no limit.
 *
 * The app trusts exactly one hop, because nginx is the only thing in front —
 * `deploy/nginx.conf.example` sets the header. Putting a CDN in front adds a
 * second hop and this function has to change with it.
 *
 * The fallback exists for local development, where no proxy sets the header.
 * It buckets every caller together, which is wrong in production and harmless
 * on a laptop — and it is why the deploy README tells you to check that real
 * addresses arrive.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const real = headers.get("x-real-ip");
  if (real) return real.trim();

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

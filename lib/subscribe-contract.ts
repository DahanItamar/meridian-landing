/**
 * The `POST /api/subscribe` wire contract, transcribed from SPEC.md §5 and §6.
 *
 * It lives in `lib/` so the route and the form share one definition rather than
 * two that agree today. No React and no DOM, per the constitution's dependency
 * direction — this file is types and one parser.
 */

/** SPEC.md §5. `locale` is a literal: one language ships, and AC-045 records it. */
export interface SubscribeRequest {
  email: string;
  /** Literal `true`. An unticked box cannot form a valid request (AC-044). */
  consent: true;
  /** Honeypot. Always empty from a real person (AC-022). */
  website: string;
  locale: "he";
}

export type SubscribeError =
  | "invalid_email"
  | "consent_missing"
  | "rate_limited"
  | "upstream_failed";

export type SubscribeResponse = { ok: true } | { ok: false; error: SubscribeError };

/**
 * The status each error answers with, per §6's error column and AC-021.
 *
 * A map rather than a switch at the call site, so adding an error code without
 * choosing its status is a type error instead of a silent 500.
 */
export const ERROR_STATUS: Record<SubscribeError, number> = {
  invalid_email: 400,
  consent_missing: 400,
  rate_limited: 429,
  upstream_failed: 502,
};

/**
 * The same rule the form applies before it ever issues a request (AC-018).
 * Deliberately stricter than `type="email"`, which accepts `a@b`.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Guards against an address long enough to be an attack rather than a typo. */
const MAX_EMAIL = 254;

export type ParseResult =
  | { ok: true; request: SubscribeRequest }
  | { ok: false; error: SubscribeError };

/**
 * Parses an untrusted body into a `SubscribeRequest`.
 *
 * Everything arriving here is attacker-controlled: a missing field, a number
 * where a string belongs, a 4 MB address. The route never reads `body.email`
 * directly — it reads what this returns, or it returns the error.
 *
 * Note what this does *not* decide: a non-empty honeypot is a valid parse. The
 * route answers `200` to it (AC-022), and telling a bot its field was read is
 * exactly what that criterion exists to prevent — so the judgment belongs to
 * the route, not to the parser.
 */
export function parseSubscribeRequest(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "invalid_email" };
  }

  const raw = body as Record<string, unknown>;

  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  if (!email || email.length > MAX_EMAIL || !EMAIL.test(email)) {
    return { ok: false, error: "invalid_email" };
  }

  if (raw.consent !== true) {
    return { ok: false, error: "consent_missing" };
  }

  return {
    ok: true,
    request: {
      email,
      consent: true,
      website: typeof raw.website === "string" ? raw.website : "",
      locale: "he",
    },
  };
}

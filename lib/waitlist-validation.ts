import type { Content } from "@/content/types";

/**
 * The launch-list field rules.
 *
 * Pure: no React, no DOM, no state — which is what `lib/` is for per the
 * constitution's dependency direction. The component wires the result to focus
 * and to `aria-invalid`; nothing here knows those exist.
 *
 * Extracted from `WaitlistSection` by refactoring 0001/R-01, because M2 adds a
 * network call, a pending state, a retry path and a honeypot to that component,
 * and rules interleaved with markup and a fetch are three unrelated reasons to
 * edit one file.
 */

/** Which control the message belongs beside. */
export type WaitlistField = "name" | "email" | "consent";

export interface WaitlistError {
  field: WaitlistField;
  message: string;
}

export interface WaitlistInput {
  name: string;
  email: string;
  consented: boolean;
}

/**
 * Deliberately stricter than `type="email"`, which accepts `a@b`. The form is
 * also `noValidate`, so this is the only check that runs — AC-018 requires an
 * inline message and *no network request*, and that decision is made here.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Returns the first failing rule, or null when the input may be submitted.
 *
 * Order is part of the contract, not an implementation detail. Consent is
 * checked last so the visitor is never asked to agree to something before they
 * have entered anything — and it is checked at all because Communications Law
 * § 30A wants an affirmative act rather than a notice that was scrolled past
 * (AC-044).
 */
export function validateWaitlist(
  input: WaitlistInput,
  errors: Content["waitlist"]["errors"],
): WaitlistError | null {
  if (!input.name.trim()) {
    return { field: "name", message: errors.name };
  }

  if (!EMAIL.test(input.email.trim())) {
    return { field: "email", message: errors.email };
  }

  if (!input.consented) {
    return { field: "consent", message: errors.consent };
  }

  return null;
}

/**
 * The content contract. Every locale module satisfies this interface, so a string
 * added here without being added to both locales is a build failure rather than an
 * `undefined` rendered to a visitor. See SPEC.md §5.
 */

export type Locale = "en" | "he";

export const LOCALES: readonly Locale[] = ["en", "he"] as const;

export const DEFAULT_LOCALE: Locale = "en";

export interface Feature {
  title: string;
  body: string;
  /** Path under /public. The same asset serves both locales. */
  image: string;
  imageAlt: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** null renders initials instead. Not every invented person needs a face. */
  avatar: string | null;
}

export interface Content {
  meta: { title: string; description: string };

  hero: {
    eyebrow: string;
    headline: string;
    sub: string;
    cta: string;
    image: string;
    imageAlt: string;
  };

  /** Exactly 3. Invented figures, disclosed in the footer (AC-035). */
  proof: { statValue: string; statLabel: string }[];

  /** Exactly 3. */
  features: Feature[];

  specs: { heading: string; rows: { label: string; value: string }[] };

  /** Invented people, disclosed in the footer (AC-035). */
  testimonials: { heading: string; items: Testimonial[] };

  faq: { heading: string; items: { question: string; answer: string }[] };

  capture: {
    heading: string;
    sub: string;
    /** Visible, programmatically associated label. Never the placeholder (AC-050). */
    label: string;
    placeholder: string;
    submit: string;
    /** Checkbox text. Names what the address is used for (AC-026, AC-044). */
    consent: string;
    /** Prefaces the privacy link beneath the form (AC-026). */
    consentNotice: string;
    /** Bumped on any wording change above; recorded per contact (AC-045). */
    consentVersion: string;
    confirmSent: string;
    success: string;
    errorInvalid: string;
    errorConsent: string;
    errorNetwork: string;
    errorRate: string;
  };

  footer: {
    disclaimer: string;
    privacyLabel: string;
    a11yLabel: string;
    rights: string;
  };

  privacy: { heading: string; body: string[] };

  /** Israeli Regs. 5773-2013 reg. 35 requires this statement (AC-049). */
  a11y: { heading: string; body: string[]; contact: string };
}

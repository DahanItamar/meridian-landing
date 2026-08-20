import { en } from "@/content/en";
import { LOCALES, type Content, type Locale } from "@/content/types";

/**
 * Locales that have a content module today. `he` joins in M3 — adding it here
 * and creating content/he.ts is the whole of that change, because nothing else
 * in the codebase branches on locale.
 */
const AVAILABLE: Partial<Record<Locale, Content>> = { en };

export const AVAILABLE_LOCALES: Locale[] = LOCALES.filter((l) => l in AVAILABLE);

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Undefined for an unknown or not-yet-translated locale. The caller decides what that means. */
export function contentFor(value: string): Content | undefined {
  return isLocale(value) ? AVAILABLE[value] : undefined;
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return locale === "he" ? "rtl" : "ltr";
}

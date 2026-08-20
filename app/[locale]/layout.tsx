import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AVAILABLE_LOCALES, contentFor, dirFor, isLocale } from "@/lib/locale";
import "../globals.css";

/**
 * This is the root layout. There is deliberately no app/layout.tsx — when every
 * route sits under a dynamic segment, that segment owns <html>, which is what
 * lets `lang` and `dir` be per-locale rather than hardcoded (AC-004, AC-005).
 */

export function generateStaticParams() {
  return AVAILABLE_LOCALES.map((locale) => ({ locale }));
}

/** Only the locales above render. Anything else is a 404, not a runtime crash. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = contentFor(locale);
  if (!content) return {};
  return { title: content.meta.title, description: content.meta.description };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} dir={dirFor(locale)}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { AVAILABLE_LOCALES, contentFor, dirFor, isLocale } from "@/lib/locale";
import "../globals.css";

/**
 * This is the root layout. There is deliberately no app/layout.tsx — when every
 * route sits under a dynamic segment, that segment owns <html>, which is what
 * lets `lang` and `dir` be per-locale rather than hardcoded (AC-004, AC-005).
 */

/**
 * next/font downloads at build time and self-hosts the result, so the container
 * build needs network access but the running container does not. `display: swap`
 * means text is readable before the font arrives rather than invisible.
 */
const display = Archivo({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

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
    <html lang={locale} dir={dirFor(locale)} className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Heebo, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { AccessibilityMenu } from "@/components/a11y/AccessibilityMenu";
import { he } from "@/content/he";
import "./globals.css";

/**
 * The root layout, and the only one.
 *
 * There used to be a `[locale]` dynamic segment here so that `lang` and `dir`
 * could be per-locale. It is gone: the site ships in Hebrew and only Hebrew, so
 * the segment bought a `/he` prefix in every URL, a redirect from `/`, and a
 * `params` promise threaded through two files — all to express a variable with
 * one value.
 *
 * Restoring a second language means restoring the segment. That is a real cost
 * and it was weighed: the alternative was carrying the machinery indefinitely
 * for a language nobody has asked for, and unused generality is the kind of
 * thing that survives because removing it feels like losing something.
 */

/**
 * next/font downloads at build time and self-hosts the result, so the container
 * build needs network access but the running container does not. `display: swap`
 * means text is readable before the font arrives rather than invisible.
 *
 * Heebo carries both scripts, which matters more here than it looks: the page
 * mixes Hebrew copy with Latin product terms ("Medium-Dark", "Meridian") inside
 * single lines, and a Hebrew face that falls back to a system Latin mid-sentence
 * changes weight and x-height mid-sentence too.
 */
const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-heebo",
  display: "swap",
});

/** The countdown's digits, and nothing else. Latin only, by design. */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: he.meta.title,
  description: he.meta.description,
};

/**
 * Umami (AC-033).
 *
 * Rendered only when both variables are set. §6 specifies the absent case as
 * "the script is not rendered; no error" — so a developer without the variables
 * gets a working site rather than a console full of failed requests, and a
 * misconfigured deploy degrades to no analytics rather than to a broken page.
 *
 * `afterInteractive` puts it after hydration: §8 records that a blocking
 * analytics script delaying first paint is the failure this guards against, and
 * the page's LCP is the headline, which must not wait on a third party.
 *
 * Umami is cookieless by design — that is the reason it was chosen over an
 * alternative that would need a consent gate before it could load at all
 * (AC-033's second clause, and ePrivacy Art. 5(3)).
 *
 * Both names carry `NEXT_PUBLIC_` because they identify a site rather than
 * authorise anything. They are the opposite of the Resend pair in AC-025, and
 * the prefix is the visible difference.
 */
function Analytics() {
  const src = process.env.NEXT_PUBLIC_UMAMI_URL;
  const siteId = process.env.NEXT_PUBLIC_UMAMI_SITE_ID;

  if (!src || !siteId) return null;

  return <Script src={src} data-website-id={siteId} strategy="afterInteractive" defer />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // AC-004. Hardcoded rather than derived, because there is one locale and a
  // lookup that can only return one answer is a lookup pretending to be a
  // decision.
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${mono.variable}`}>
      <body>
        {children}
        {/* In the layout, not the page: the menu has to reach /privacy and
            /accessibility too, and a visitor who raised the text size does not
            expect it to drop back when they follow a footer link. */}
        <AccessibilityMenu content={he} />
        <Analytics />
      </body>
    </html>
  );
}

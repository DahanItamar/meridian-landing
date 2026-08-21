import Link from "next/link";
import { Roundel } from "@/components/brand/Roundel";
import { Reveal } from "@/components/motion/Reveal";
import { JumpLink } from "@/components/nav/JumpLink";
import type { Content } from "@/content/types";

/**
 * Every link here resolves to a section that exists on this page (AC-067).
 *
 * There were two columns before — "המוצר" and "השקה" — naming six destinations,
 * of which three had been deleted, one was an FAQ retired with AC-012, and one
 * was a contact page that never existed. All six pointed at `#top` regardless,
 * so the footer worked by accident: nothing 404'd because nothing navigated.
 *
 * The privacy and accessibility links are deliberately absent rather than
 * pointing at pages that are not built. They come back with T-07 and T-10, at
 * which point they are required rather than decorative — Israeli Regs.
 * 5773-2013 reg. 35 for the accessibility statement, and the consent notice for
 * privacy. Nothing is collected today, so neither is owed today.
 */
export function SiteFooter({ content }: { content: Content }) {
  const { brand, footer } = content;

  return (
    <footer className="border-line border-t px-4 pt-12 pb-9 sm:px-10">
      {/* AC-014 reaches the footer too — it is a section below the pinned
          sequence. Only the masthead row moves; the legal row below is left
          alone, because a disclosure that animates in is a disclosure that can
          be missed by anyone who lands already scrolled to the bottom. */}
      <Reveal className="mx-auto flex max-w-[80rem] flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-gold flex items-center gap-2.5">
            <Roundel size={34} />
            <span className="text-ink text-sm font-bold">
              {brand.name} {brand.tagline}
            </span>
          </span>
        </div>

        <nav aria-label="קישורים בעמוד" className="flex flex-wrap gap-x-7 gap-y-1">
          {footer.links.map((link) =>
            // A fragment scrolls; a path navigates. JumpLink intercepts the
            // click, so handing it a route would swallow the navigation.
            link.href.startsWith("#") ? (
              <JumpLink
                key={link.href}
                href={link.href}
                className="tap text-muted-2 hover:text-ink text-[13.5px] transition-colors duration-150"
              >
                {link.label}
              </JumpLink>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="tap text-muted-2 hover:text-ink text-[13.5px] transition-colors duration-150"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </Reveal>

      <div className="border-line mx-auto mt-10 flex max-w-[80rem] flex-col gap-4 border-t pt-6 sm:flex-row-reverse sm:items-start sm:justify-between">
        <p className="text-fainter text-xs">{footer.copyright}</p>
        {/* AC-035. Kept beside the copyright rather than floated on its own row:
            a disclosure the eye skips is a disclosure that is not made. */}
        <p className="text-fainter max-w-[70ch] text-[11.5px] leading-[1.7]">{footer.disclosure}</p>
      </div>
    </footer>
  );
}

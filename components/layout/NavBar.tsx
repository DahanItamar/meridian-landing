import { Roundel } from "@/components/brand/Roundel";
import { JumpLink } from "@/components/nav/JumpLink";
import type { Content } from "@/content/types";

/**
 * Fixed, translucent, hairline-bottomed. It sits above the pinned viewport, so
 * the z-index is the one thing here that must not be casually changed.
 *
 * Both hrefs are in-page anchors that exist further down this page — there is
 * no second route, and a nav link to a 404 is worse than no nav link.
 */
export function NavBar({ content }: { content: Content }) {
  const { nav, brand } = content;

  return (
    <header className="border-line fixed inset-x-0 top-0 z-[var(--z-nav)] border-b bg-[rgba(8,8,10,0.72)] backdrop-blur-2xl">
      <nav
        aria-label="ראשי"
        className="mx-auto flex max-w-[80rem] flex-wrap items-center justify-between gap-5 px-4 py-3 sm:px-8"
      >
        <JumpLink href="#top" className="text-gold flex items-center gap-2.5">
          <Roundel size={32} />
          <span className="text-ink flex flex-col leading-[1.15]">
            <span className="text-sm font-bold tracking-[-0.01em]">{brand.name}</span>
            <span className="text-subtle text-[9.5px] tracking-[0.22em] uppercase">
              {brand.tagline}
            </span>
          </span>
        </JumpLink>

        <JumpLink
          href="#roast"
          className="tap text-muted-2 hover:text-ink text-[14.5px] font-medium transition-colors duration-150"
        >
          {nav.roast}
        </JumpLink>
      </nav>
    </header>
  );
}

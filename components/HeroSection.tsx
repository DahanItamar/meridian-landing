import Image from "next/image";
import type { Content } from "@/content/types";

/**
 * AC-009: product name, headline, subheadline, one primary CTA and the product
 * image, all within the first viewport at 1280x720 and above. The vertical
 * budget is the constraint that shapes this layout — hence the capped padding
 * and the `lg:` type sizes stopping where they do.
 *
 * AC-029: this image is the LCP element and carries `priority`. Every other
 * image on the page lazy-loads, which is the default.
 */
export function HeroSection({ content }: { content: Content }) {
  const { brand, hero } = content;

  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
        <div>
          <p className="font-display text-lg tracking-[0.2em] text-ink uppercase">{brand.name}</p>

          <p className="mt-6 text-sm tracking-[0.14em] text-brand uppercase">{hero.eyebrow}</p>

          <h1 className="mt-3 text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>

          <p className="mt-5 max-w-prose text-base leading-relaxed text-muted lg:text-lg">
            {hero.sub}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#launch-list"
              className="inline-flex min-h-11 items-center rounded-card bg-brand px-6 py-3 text-base font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
            >
              {hero.cta}
            </a>
            <span className="text-sm text-muted">{brand.product}</span>
          </div>
        </div>

        <div className="relative aspect-[3/2] overflow-hidden rounded-card bg-surface-raised">
          <Image
            src={hero.image}
            alt={hero.imageAlt}
            width={hero.width}
            height={hero.height}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

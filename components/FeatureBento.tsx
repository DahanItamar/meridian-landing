import Image from "next/image";
import type { Content } from "@/content/types";

/**
 * Bento grid: one wide lead card, two narrower cards beneath it. The asymmetry
 * is the point — three equal columns read as a spec sheet, whereas a dominant
 * first cell tells the eye which claim matters most.
 *
 * Column spans are set with `col-span`, which is writing-mode aware, so the
 * arrangement mirrors correctly in RTL without a second layout (AC-007).
 */
export function FeatureBento({ content }: { content: Content }) {
  const [lead, ...rest] = content.features;

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Lead card — image and copy side by side, spanning the full width */}
          <article className="group grid gap-8 overflow-hidden rounded-2xl border border-line bg-surface-raised p-6 sm:grid-cols-2 sm:items-center sm:p-8 lg:col-span-2 lg:gap-12 lg:p-10">
            <div>
              <p className="text-xs tracking-[0.18em] text-brand uppercase">01</p>
              <h3 className="mt-4 text-2xl leading-tight text-ink lg:text-4xl">{lead.title}</h3>
              <p className="mt-5 max-w-prose leading-relaxed text-muted">{lead.body}</p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface">
              <Image
                src={lead.image}
                alt={lead.imageAlt}
                width={lead.width}
                height={lead.height}
                sizes="(min-width: 640px) 40vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
          </article>

          {/* Two supporting cards — image above copy */}
          {rest.map((feature, i) => (
            <article
              key={feature.title}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-raised"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                <Image
                  src={feature.image}
                  alt={feature.imageAlt}
                  width={feature.width}
                  height={feature.height}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 p-6 lg:p-8">
                <p className="text-xs tracking-[0.18em] text-brand uppercase">
                  {String(i + 2).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-xl leading-tight text-ink lg:text-2xl">{feature.title}</h3>
                <p className="mt-4 leading-relaxed text-muted">{feature.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

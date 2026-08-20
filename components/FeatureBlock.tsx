import Image from "next/image";
import type { Feature } from "@/content/types";

/**
 * One benefit per block, image alternating side to side.
 *
 * The alternation uses `order`, not `flex-row-reverse` or a left/right utility.
 * Order is direction-neutral, so the rhythm survives the flip to RTL in M3
 * without any component knowing which way the page reads (AC-007).
 *
 * No `priority` here: only the hero preloads, everything else lazy-loads, which
 * is next/image's default (AC-029).
 */
export function FeatureBlock({ feature, index }: { feature: Feature; index: number }) {
  const imageFirst = index % 2 === 1;

  return (
    <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
      <div className={imageFirst ? "lg:order-2" : "lg:order-1"}>
        <h3 className="text-2xl text-ink lg:text-3xl">{feature.title}</h3>
        <p className="mt-4 max-w-prose leading-relaxed text-muted">{feature.body}</p>
      </div>

      <div
        className={`relative aspect-[4/3] overflow-hidden rounded-card bg-surface-raised ${
          imageFirst ? "lg:order-1" : "lg:order-2"
        }`}
      >
        <Image
          src={feature.image}
          alt={feature.imageAlt}
          width={feature.width}
          height={feature.height}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

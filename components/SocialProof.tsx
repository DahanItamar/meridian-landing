import type { Content } from "@/content/types";

/**
 * The strip immediately under the fold. Three invented figures, disclosed in the
 * footer (AC-035) — they exist to give the eye somewhere to land between the
 * hero and the first feature, not to make a claim.
 */
export function SocialProof({ content }: { content: Content }) {
  return (
    <section className="border-b border-line bg-surface-raised">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-3 sm:gap-6">
        {content.proof.map((stat) => (
          <div key={stat.statLabel} className="text-center sm:text-start">
            <p className="font-display text-3xl text-ink lg:text-4xl">{stat.statValue}</p>
            <p className="mt-1 text-sm text-muted">{stat.statLabel}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

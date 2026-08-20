import type { Content } from "@/content/types";

/**
 * A definition list, because that is what this is. Using <dl>/<dt>/<dd> rather
 * than a grid of divs means a screen reader announces each value as belonging to
 * its label instead of reading sixteen unrelated fragments (AC-032's sibling
 * concern, and plain correctness).
 */
export function SpecGrid({ content }: { content: Content }) {
  return (
    <section className="border-y border-line bg-surface-deep text-ink-inverse">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <h2 className="text-2xl text-ink-inverse lg:text-3xl">{content.specs.heading}</h2>

        <dl className="mt-10 grid gap-x-12 gap-y-0 sm:grid-cols-2">
          {content.specs.rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-6 border-b border-white/10 py-4"
            >
              <dt className="text-sm tracking-wide text-muted-inverse uppercase">{row.label}</dt>
              <dd className="text-end text-base text-ink-inverse">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

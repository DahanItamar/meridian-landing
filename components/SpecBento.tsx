import type { Content } from "@/content/types";

/**
 * The lot card. A definition list inside a bento cell, so a screen reader still
 * announces each value as belonging to its label rather than reading eighteen
 * unrelated fragments — the visual treatment does not cost the semantics.
 *
 * The two highlight cells are pulled from the same data, not duplicated, so the
 * spec table stays the single source of truth.
 */
export function SpecBento({ content }: { content: Content }) {
  const rows = content.specs.rows;
  const notes = rows.find((r) => r.label === "Tasting notes");
  const price = rows.find((r) => r.label === "Price");

  return (
    <section className="border-y border-line bg-surface-deep text-ink-inverse">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <h2 className="text-3xl text-ink-inverse lg:text-4xl">{content.specs.heading}</h2>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-2 lg:p-8">
            <dl className="grid gap-x-12 sm:grid-cols-2">
              {rows.map((row) => (
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

          <div className="grid gap-5">
            {notes ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:p-8">
                <p className="text-sm tracking-wide text-muted-inverse uppercase">{notes.label}</p>
                <p className="mt-4 font-display text-2xl leading-snug text-ink-inverse lg:text-3xl">
                  {notes.value}
                </p>
              </div>
            ) : null}
            {price ? (
              <div className="flex flex-col justify-between rounded-2xl border border-brand/40 bg-brand/10 p-6 lg:p-8">
                <p className="text-sm tracking-wide text-muted-inverse uppercase">{price.label}</p>
                <p className="mt-4 font-display text-4xl text-ink-inverse lg:text-5xl">
                  {price.value}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

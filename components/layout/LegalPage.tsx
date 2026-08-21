import Link from "next/link";
import { Roundel } from "@/components/brand/Roundel";
import type { Content, LegalDoc } from "@/content/types";

/**
 * The shared shell for the privacy policy and the accessibility statement.
 *
 * Both are long-form reading rather than landing-page composition, so the
 * measure is capped near 70ch and the type is set at a size somebody can read a
 * thousand words of — the display scale used elsewhere on this site is for
 * headlines that are looked at, not text that is read.
 *
 * The draft notice is not decoration. Each document still has values only the
 * operator can supply, and a legal page published with a silent gap is worse
 * than one published with a loud one: the reader cannot tell which parts are
 * finished, and neither can whoever ships it.
 */
export function LegalPage({ content, doc }: { content: Content; doc: LegalDoc }) {
  const { legal, brand } = content;

  return (
    <div className="mx-auto max-w-[46rem] px-4 py-16 sm:px-8 sm:py-24">
      <Link href="/" className="text-gold inline-flex items-center gap-2.5">
        <Roundel size={30} />
        <span className="text-muted-2 hover:text-ink text-[13px] transition-colors duration-150">
          {legal.backToSite}
        </span>
      </Link>

      <h1 className="mt-10 text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.15] font-extrabold tracking-[-0.03em]">
        {doc.title}
      </h1>
      <p className="text-fainter mt-3 font-mono text-[11px] tracking-[0.16em]">{doc.updated}</p>

      {/* AC-035. A legal page can be linked to directly, so the disclosure that
          the footer carries on the landing page has to be repeated where it can
          be read on its own. Stated as fact rather than as a draft warning —
          nothing here is collected, and saying so plainly is both accurate and
          the thing a reader actually needs to know. */}
      <p
        role="note"
        className="border-card-line bg-surface-raised text-muted rounded-card mt-8 border p-5 text-[13.5px] leading-[1.8]"
      >
        {legal.demoNotice}
      </p>

      <p className="text-muted mt-9 text-[16px] leading-[1.85] font-light">{doc.intro}</p>

      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-11">
          <h2 className="text-[19px] font-bold tracking-[-0.015em]">{section.heading}</h2>

          {section.body.map((paragraph) => (
            <p key={paragraph} className="text-muted mt-4 text-[15.5px] leading-[1.9] font-light">
              {paragraph}
            </p>
          ))}

          {section.rows ? (
            <dl className="border-card-line mt-5 flex flex-col gap-0.5 border-t pt-4">
              {section.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-wrap items-baseline justify-between gap-3 py-2"
                >
                  <dt className="text-subtle text-[12.5px] font-medium">{row.label}</dt>
                  <dd className="text-end text-[14.5px]">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ))}

      <p className="border-line text-fainter mt-14 border-t pt-6 text-[11.5px] leading-[1.7]">
        {brand.name} {brand.tagline} · {content.footer.disclosure}
      </p>
    </div>
  );
}

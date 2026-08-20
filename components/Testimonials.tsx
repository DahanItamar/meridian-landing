import Image from "next/image";
import type { Content, Testimonial } from "@/content/types";
import { initials } from "@/lib/initials";

/**
 * Invented people, disclosed in the footer (AC-035).
 *
 * `avatar: null` renders initials rather than a stock headshot. Putting a real
 * stranger's face beside a quotation they never said is a different kind of
 * claim from inventing the quotation, and not one worth making for a demo.
 */
function Avatar({ person }: { person: Testimonial }) {
  if (person.avatar) {
    return (
      <Image
        src={person.avatar}
        alt=""
        width={40}
        height={40}
        className="size-10 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-medium text-brand"
    >
      {initials(person.name)}
    </span>
  );
}

export function Testimonials({ content }: { content: Content }) {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <h2 className="text-2xl text-ink lg:text-3xl">{content.testimonials.heading}</h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {content.testimonials.items.map((person) => (
            <figure
              key={person.name}
              className="flex flex-col rounded-card border border-line bg-surface-raised p-6"
            >
              <blockquote className="flex-1 leading-relaxed text-ink">
                {person.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                <Avatar person={person} />
                <span>
                  <span className="block text-sm font-medium text-ink">{person.name}</span>
                  <span className="block text-sm text-muted">{person.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

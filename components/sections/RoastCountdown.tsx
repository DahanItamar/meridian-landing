"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import type { Content } from "@/content/types";

/**
 * Counts down to the next roast.
 *
 * THE TARGET IS NOT A DATE. It is recomputed from the clock on every tick as
 * the next Monday 08:00, so the counter can never expire: the moment it reaches
 * zero the same function returns the following week and the display rolls over.
 * A launch page whose countdown has run out is worse than a page with no
 * countdown, and this one sits in a portfolio that has to still be right in a
 * year with nobody maintaining it.
 *
 * It is also true to the product rather than invented urgency — the pack says
 * "roasted in small batches", and this is when the next batch goes in.
 */

/** 1 = Monday, in `Date.getDay()` terms. */
const ROAST_DAY = 1;
const ROAST_HOUR = 8;

function msUntilNextRoast(from: number): number {
  const t = new Date(from);
  t.setHours(ROAST_HOUR, 0, 0, 0);
  t.setDate(t.getDate() + ((ROAST_DAY - t.getDay() + 7) % 7));
  // Already past this week's slot — including the case where today *is* the
  // roast day but the hour has gone.
  if (t.getTime() <= from) t.setDate(t.getDate() + 7);
  return t.getTime() - from;
}

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function RoastCountdown({ content }: { content: Content }) {
  const c = content.countdown;

  /**
   * Null until mounted, and the server renders placeholders.
   *
   * The alternative is computing the time during render, which produces
   * different HTML on the server and the client and hydrates into a mismatch —
   * and the mismatch is invisible in development, because the two clocks are
   * milliseconds apart on one machine.
   */
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(msUntilNextRoast(Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const t = left === null ? null : split(left);

  const cells = [
    { value: t && String(t.days), label: c.units.days },
    { value: t && pad(t.hours), label: c.units.hours },
    { value: t && pad(t.minutes), label: c.units.minutes },
    { value: t && pad(t.seconds), label: c.units.seconds },
  ];

  return (
    <section
      id="roast"
      className="border-line border-t px-4 py-16 text-center sm:px-10 sm:py-20 lg:py-[108px]"
    >
      {/*
        One line, set as a lead rather than a display heading. At the display
        size the rest of the page uses, a full sentence with a call to action in
        it wraps to four lines and stops reading like a sentence.
      */}
      <Reveal>
        <h2 className="mx-auto max-w-[38ch] text-[clamp(1.25rem,2.3vw,1.75rem)] leading-[1.5] font-medium tracking-[-0.01em]">
          {c.heading}
        </h2>
      </Reveal>

      <Reveal delay={0.12}>
        {/*
          `aria-live="off"` on purpose. A region that announces every second
          makes the page unusable with a screen reader, so the digits are hidden
          from assistive tech entirely and the sentence below carries the same
          information in a form worth reading once.
        */}
        <div
          role="timer"
          aria-live="off"
          aria-hidden="true"
          // The clock runs LTR inside an RTL page: largest unit on the left,
          // seconds on the right. Done with `dir` rather than by reversing the
          // array, so the cells stay in logical order in the source and the
          // direction is one attribute to flip if that ever changes back.
          dir="ltr"
          // Four columns that divide the width, not four boxes that wrap. As a
          // flex row with a min-width the cells needed 372px on a 358px phone
          // and broke 3 + 1, which orphaned the seconds on their own centred
          // line and read as a layout fault. A clock is one row or it is not a
          // clock. The max-width stops the cells sprawling on a wide screen now
          // that nothing else bounds them.
          className="mx-auto mt-11 grid max-w-[480px] grid-cols-4 items-start gap-2 sm:gap-4"
        >
          {cells.map((cell) => (
            <div
              key={cell.label}
              className="border-card-line bg-surface-raised rounded-card border px-2 py-5 sm:px-6"
            >
              <span className="text-ink block font-mono text-[clamp(1.9rem,4.4vw,2.9rem)] leading-none font-medium tabular-nums">
                {cell.value ?? "––"}
              </span>
              <span className="text-subtle mt-2.5 block text-[11px] tracking-[0.2em]">
                {cell.label}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      {t ? (
        <p className="sr-only">
          {c.a11y} {t.days} {c.units.days}, {t.hours} {c.units.hours} {c.units.minutes} {t.minutes}.
        </p>
      ) : null}
    </section>
  );
}

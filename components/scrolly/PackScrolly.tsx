"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Content } from "@/content/types";
import {
  SCROLLY_HEIGHT_VH,
  SCROLLY_STEPS,
  activeStep,
  fadeWindow,
  washX,
} from "@/lib/scrolly-config";
import { BeansLoader } from "@/components/brand/BeansLoader";
import { JumpLink } from "@/components/nav/JumpLink";
import { scrollState } from "@/lib/scroll-store";

/**
 * WebGL cannot render on the server and `<Canvas>` touches `window` on first
 * paint, so the stage is loaded on the client only. The section is laid out and
 * readable before it arrives — the copy is DOM, not texture.
 */
const PackStage = dynamic(() => import("@/components/three/PackStage").then((m) => m.PackStage), {
  ssr: false,
});

/**
 * The pinned sequence: 440vh of scroll, one screen of sticky stage, four beats
 * of copy that cross-fade over it while the pack turns underneath.
 *
 * Progress is MEASURED, never accumulated. getBoundingClientRect() is true no
 * matter what scrolls or how far — an accumulated delta drifts the moment
 * anything else on the page moves, and this sequence is four screens long.
 */
export function PackScrolly({ content }: { content: Content }) {
  const section = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);

  /**
   * AC-061. The canvas is not in the first paint.
   *
   * `next/dynamic` already keeps the WebGL chunk out of the server render, but
   * it still starts fetching during hydration — 227 kB of parse competing with
   * the headline for the main thread. `mounted` flips in an effect, which runs
   * after the browser has painted, and idle time is preferred where the browser
   * offers it. The timeout is the floor: `requestIdleCallback` on a busy page
   * can wait a long time, and the pack should not.
   */
  const [mounted, setMounted] = useState(false);
  const [packReady, setPackReady] = useState(false);

  useEffect(() => {
    const start = () => setMounted(true);
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(start, { timeout: 1200 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(start, 200);
    return () => clearTimeout(id);
  }, []);

  const onPackReady = useCallback(() => setPackReady(true), []);

  useEffect(() => {
    const el = section.current;
    if (!el) return;

    let raf = 0;
    let running = true;

    /** Idempotent: every driver below calls this and none of them accumulate. */
    const measure = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const total = r.height - vh;
      const next = total <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / total));

      scrollState.progress = next;
      // A re-render per scroll pixel would be four hundred of them across the
      // section for movement no one can see. The stage reads scrollState every
      // frame regardless, so this threshold only gates the DOM copy.
      setP((prev) => (Math.abs(next - prev) > 0.002 ? next : prev));
    };

    const tick = () => {
      if (!running) return;
      measure();
      raf = requestAnimationFrame(tick);
    };

    /**
     * The rAF loop runs only while the section is on screen; the scroll and
     * resize listeners run always, so the value is already correct on the frame
     * the section comes back into view rather than one frame later.
     *
     * The scroll listener is capture-phase: on a page whose scroller is not the
     * window — an embed, a modal, a browser that puts the page in a container —
     * a bubbling listener on window never fires.
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        scrollState.visible = entry.isIntersecting;
        if (entry.isIntersecting && !raf) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && raf) {
          running = false;
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "10% 0px" },
    );
    observer.observe(el);

    document.addEventListener("scroll", measure, { capture: true, passive: true });
    window.addEventListener("resize", measure, { passive: true });
    measure();

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("scroll", measure, { capture: true });
      window.removeEventListener("resize", measure);
    };
  }, []);

  const active = activeStep(p);
  const { beats, stageLabel, hint } = content.scrolly;

  return (
    <section
      ref={section}
      id="top"
      aria-label={stageLabel}
      className="relative"
      style={{ height: `${SCROLLY_HEIGHT_VH}vh` }}
    >
      <div className="bg-surface sticky top-0 isolate h-screen overflow-hidden">
        {/* The stage's own ground. The pack is lit as a product on a dark set,
            and a flat page background under it reads as a cut-out. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: "radial-gradient(58% 54% at 50% 44%, #17120e 0%, #0c0a09 46%, #08080a 78%)",
          }}
        />

        {/* The warm wash sits under the pack wherever the camera has put it, so
            the light reads as belonging to the object rather than to the page.
            Its stops are the keyframe times from lib/scrolly-config.ts — centre,
            then left, right, left, right — not an oscillation. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            transition: "background 350ms linear",
            background: `radial-gradient(52% 50% at ${washX(p).toFixed(1)}% 46%, rgba(227,183,124,0.15) 0%, rgba(201,162,95,0.05) 44%, rgba(8,8,10,0) 76%)`,
          }}
        />

        {/*
          AC-061, AC-062. The poster is real markup in the server render, at the
          section's full height, so the first viewport shows the product rather
          than an empty stage — and because it is absolutely positioned inside a
          container that already has its height, mounting the canvas over it
          moves nothing.

          Two frames because the choreography frames the pack differently above
          and below lg; scripts/poster.mjs captures one at each, at that same
          64rem. `alt=""` and aria-hidden: it is the same object the canvas
          draws, and every word on this section is DOM text beside it (AC-054).

          Three encodings each, most efficient first — the browser takes the
          first `type` it understands, so a browser without AVIF falls to WebP
          and one without either falls to the PNG on the `img`. The saving is
          not marginal: this frame is 210 KB as a PNG and 9 KB as AVIF, because
          a soft-lit render on a transparent ground is the worst case for PNG
          and close to the best case for both of the others.
        */}
        <picture>
          <source
            media="(min-width: 64rem)"
            type="image/avif"
            srcSet="/art/pack-poster-wide.avif"
          />
          <source
            media="(min-width: 64rem)"
            type="image/webp"
            srcSet="/art/pack-poster-wide.webp"
          />
          <source media="(min-width: 64rem)" srcSet="/art/pack-poster-wide.png" />
          <source type="image/avif" srcSet="/art/pack-poster-narrow.avif" />
          <source type="image/webp" srcSet="/art/pack-poster-narrow.webp" />
          <img
            src="/art/pack-poster-narrow.png"
            alt=""
            aria-hidden="true"
            // The narrow frame's own dimensions, matching the `src` beside them.
            // They reserve nothing — the element is absolutely positioned and
            // sized by its parent — but a wrong intrinsic ratio here is the kind
            // of thing that becomes a real bug the moment the layout changes.
            width={430}
            height={932}
            className="absolute inset-0 h-full w-full object-contain"
            style={{
              transition: "opacity 450ms ease-out",
              opacity: packReady ? 0 : 1,
            }}
          />
        </picture>

        {mounted ? <PackStage onReady={onPackReady} /> : null}

        {/* Shown only while the pack is still arriving. The poster says what
            the product is; this says it is not finished loading. Both leave
            together. */}
        {!packReady ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-[18%] flex justify-center"
          >
            <BeansLoader />
          </div>
        ) : null}

        <div className="relative z-[var(--z-raised)] mx-auto h-full max-w-[80rem] px-4 sm:px-8 lg:px-14">
          {beats.map((beat, i) => {
            const t = fadeWindow(i, p);
            // In RTL, "start" is the right edge — the beats alternate sides as
            // the pack turns, so the copy always sits opposite the panel it is
            // describing. The column takes the half the camera has vacated, so
            // text and pack cannot overlap on a wide screen.
            const end = SCROLLY_STEPS[i].align === "end";
            const Heading = i === 0 ? "h1" : "h2";
            const style: CSSProperties = {
              marginInlineStart: end ? "auto" : 0,
              marginInlineEnd: end ? 0 : "auto",
              opacity: t,
              // The `.beat` rule in globals.css turns this into the full
              // transform — it is the half that differs by breakpoint.
              ["--beat-y" as string]: `${((1 - t) * 30).toFixed(1)}px`,
              filter: `blur(${((1 - t) * 6).toFixed(2)}px)`,
              pointerEvents: t > 0.6 ? "auto" : "none",
              transition: "opacity 500ms ease-out, transform 500ms ease-out, filter 500ms ease-out",
            };

            return (
              <div
                key={SCROLLY_STEPS[i].id}
                // A beat that has faded out is not just invisible, it is gone:
                // otherwise a keyboard user tabs into four stacked headlines and
                // a screen reader reads all four at once.
                aria-hidden={t < 0.6}
                inert={t < 0.6 ? true : undefined}
                className="beat absolute start-0 end-0 top-[13%] lg:start-14 lg:end-14 lg:top-1/2"
                style={style}
              >
                <p className="text-gold font-mono text-[11px] tracking-[0.32em] uppercase">
                  {beat.kicker}
                </p>
                {/*
                  Only the first beat is the page's h1 (AC-032). The other two
                  are h2, and nothing about them looks different: every size,
                  weight and letter-spacing here is a utility class, so the tag
                  contributes no styling of its own. What changes is what a
                  screen reader and a search crawler see — three h1 elements in
                  one sticky container reads as three separate documents.
                */}
                <Heading className="mt-[18px] text-[clamp(2.35rem,5vw,4.1rem)] leading-[1.02] font-extrabold tracking-[-0.032em]">
                  {beat.title}
                </Heading>

                {beat.body ? (
                  <p className="text-muted mt-[22px] text-[17.5px] leading-[1.72] font-light">
                    {beat.body}
                  </p>
                ) : null}

                {beat.rows ? (
                  <div className="border-gold/55 mt-[26px] flex flex-col gap-0.5 border-s-2 ps-5">
                    {beat.rows.map((row) => (
                      <div
                        key={row.label}
                        className="flex flex-wrap items-baseline gap-2.5 py-[9px]"
                      >
                        <span className="text-subtle text-xs font-medium tracking-[0.14em] uppercase">
                          {row.label}
                        </span>
                        <span className="text-[17px]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {beat.ctas ? (
                  <div className="mt-8 flex flex-wrap gap-3">
                    <JumpLink href="#waitlist" className="btn btn-solid h-13 px-7 text-[15.5px]">
                      {beat.ctas.primary}
                    </JumpLink>
                  </div>
                ) : null}

                {beat.buy ? (
                  <>
                    <a href="#waitlist" className="btn btn-gold mt-[30px] h-13 px-[26px] text-base">
                      <span>{beat.buy.label}</span>
                      <span aria-hidden="true" className="text-[15px] leading-none rtl:rotate-180">
                        →
                      </span>
                    </a>
                    <p className="text-subtle mt-4 text-[13px] font-light">{beat.buy.note}</p>
                  </>
                ) : null}
              </div>
            );
          })}

          {/* Fades out the moment scrolling starts: the sequence is invisible
              until someone scrolls, so it has to be obvious that scrolling is
              the gesture. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-[84px] flex justify-center"
            style={{
              transition: "opacity 400ms ease-out",
              opacity: Math.max(0, 1 - p / 0.035),
            }}
          >
            <span className="flex flex-col items-center gap-2.5">
              <span className="text-subtle text-[12.5px] font-medium">{hint}</span>
              <span className="border-hairline-decor flex h-[38px] w-6 justify-center rounded-full border pt-[7px]">
                <span className="bg-gold h-2 w-[3px] rounded-[3px]" />
              </span>
            </span>
          </div>

          <div className="absolute inset-x-4 bottom-8 flex items-center gap-4 sm:inset-x-8 lg:inset-x-14">
            <div aria-hidden="true" className="flex gap-[7px]">
              {SCROLLY_STEPS.map((step, i) => (
                <span
                  key={step.id}
                  className="h-0.5 w-[22px] rounded-[2px] transition-colors duration-300"
                  style={{ backgroundColor: i === active ? "#c9a25f" : "#3a3430" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

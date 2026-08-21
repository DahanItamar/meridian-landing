"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import type { Content } from "@/content/types";
import { scrollState } from "@/lib/scroll-store";

/**
 * The WebGL bundle is the largest thing on this page, so it is never part of the
 * server render and never blocks first paint. `ssr: false` also avoids asking a
 * Node process to construct a WebGL context it cannot have.
 */
const HeroScene = dynamic(() => import("./three/HeroScene").then((m) => m.HeroScene), {
  ssr: false,
  loading: () => null,
});

/**
 * Fades a block in over its own slice of the scroll, and back out after it.
 *
 * `startVisible` exists because the first panel is already on screen when the
 * page loads: fading it in from zero would leave the headline invisible until
 * the visitor scrolls, which is the opposite of what a hero is for.
 */
function Panel({
  progress,
  range,
  children,
  align,
  startVisible = false,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number, number, number];
  children: React.ReactNode;
  align: "start" | "end";
  startVisible?: boolean;
}) {
  const opacity = useTransform(progress, range, startVisible ? [1, 1, 1, 0] : [0, 1, 1, 0]);
  const y = useTransform(progress, range, startVisible ? [0, 0, 0, -28] : [28, 0, 0, -28]);

  return (
    <motion.div
      style={{ opacity, y }}
      aria-hidden={undefined}
      className={`pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 lg:inset-x-14 ${
        align === "start" ? "lg:me-auto lg:max-w-lg" : "lg:ms-auto lg:max-w-lg"
      }`}
    >
      <div className="pointer-events-auto">{children}</div>
    </motion.div>
  );
}

/** Small pill used for the origin metadata block. */
function Meta({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="mt-7 space-y-2 border-s-2 border-brand/50 ps-5">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap gap-x-3 text-sm">
          <dt className="tracking-[0.14em] text-muted uppercase">{row.label}</dt>
          <dd className="text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function HeroScrolly({ content }: { content: Content }) {
  const container = useRef<HTMLDivElement>(null);
  const { brand, hero, specs, features } = content;

  const originRows = specs.rows.filter((r) =>
    ["Origin", "Altitude", "Process", "Tasting notes"].includes(r.label),
  );

  // Progress across the whole scrollytelling container: 0 when its top meets
  // the viewport top, 1 when its bottom does.
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  // Hand the value to the WebGL tree without re-rendering React on every frame.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollState.progress = v;
  });

  return (
    <section ref={container} className="relative h-[360vh] bg-surface">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/*
          Warm key light behind the pack. This is a radial wash on the page
          rather than a filter on the canvas: bloom on a WebGL layer costs a
          post-processing pass every frame, and at this size the two are
          indistinguishable.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(58% 52% at 34% 46%, rgba(194,112,63,0.30) 0%, rgba(194,112,63,0.10) 38%, rgba(11,9,8,0) 72%)",
          }}
        />

        <div className="absolute inset-0 z-10">
          <HeroScene />

          {/* Seen by anyone whose browser or settings block scripts entirely. It
              is the same product at a similar size, so nothing jumps when the
              canvas takes over. */}
          <noscript>
            <div className="grid h-full place-items-center">
              <Image
                src={hero.image}
                alt={hero.imageAlt}
                width={hero.width}
                height={hero.height}
                priority
                className="h-[62vh] w-auto object-contain"
              />
            </div>
          </noscript>
        </div>

        <div className="relative z-20 mx-auto h-full max-w-6xl">
          {/* Beat 1 — the pitch. Pack sits to the inline start, copy opposite. */}
          <Panel
            progress={scrollYProgress}
            range={[0, 0.05, 0.2, 0.29]}
            align="end"
            startVisible
          >
            <p className="text-xs tracking-[0.34em] text-brand uppercase">{brand.name}</p>
            <h1 className="display mt-5 text-5xl text-ink sm:text-6xl lg:text-7xl">
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-prose leading-relaxed text-muted lg:text-lg">{hero.sub}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#launch-list"
                className="inline-flex min-h-11 items-center rounded-card bg-brand px-6 py-3 font-medium text-ink-inverse transition-colors duration-150 hover:bg-brand-hover"
              >
                {hero.cta}
              </a>
              <span className="text-sm text-muted">{brand.product}</span>
            </div>
          </Panel>

          {/* Beat 2 — origin. Pack centred and turning, copy opposite. */}
          <Panel progress={scrollYProgress} range={[0.31, 0.4, 0.54, 0.62]} align="end">
            <p className="text-xs tracking-[0.34em] text-brand uppercase">{hero.eyebrow}</p>
            <h2 className="display mt-5 text-4xl text-ink sm:text-5xl lg:text-6xl">
              {features[0].title}
            </h2>
            <Meta rows={originRows} />
          </Panel>

          {/* Beat 3 — the reverse of the pack. Pack moves to the inline end, so
              the copy crosses to the inline start. */}
          <Panel progress={scrollYProgress} range={[0.64, 0.73, 0.88, 0.97]} align="start">
            <p className="text-xs tracking-[0.34em] text-brand uppercase">{features[2].title}</p>
            <h2 className="display mt-5 text-4xl text-ink sm:text-5xl lg:text-6xl">
              {features[1].title}
            </h2>
            <p className="mt-6 max-w-prose leading-relaxed text-muted">{features[2].body}</p>
          </Panel>
        </div>

        {/* Scroll affordance — the sequence is invisible until someone scrolls,
            so it needs to be obvious that scrolling is the interaction. */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.06], [1, 0]) }}
          className="absolute inset-x-0 bottom-8 z-20 flex justify-center"
        >
          <span className="h-10 w-6 rounded-full border border-edge">
            <span className="mx-auto mt-2 block h-2 w-1 rounded-full bg-brand" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}

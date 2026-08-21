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
 * One beat of copy, tied to the same scroll slice as the pose it belongs to.
 *
 * The fades overlap the model's holds rather than its moves: text arriving while
 * the pack is still travelling is what made the earlier version read as a page
 * with a bag drifting past it. Copy now lands after the pack has settled and
 * leaves before it departs.
 */
function Beat({
  progress,
  at,
  align,
  children,
  startVisible = false,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  /** [fadeInStart, fullyIn, startFadeOut, fullyOut] */
  at: [number, number, number, number];
  align: "start" | "end";
  children: React.ReactNode;
  startVisible?: boolean;
}) {
  const opacity = useTransform(progress, at, startVisible ? [1, 1, 1, 0] : [0, 1, 1, 0]);
  const y = useTransform(progress, at, startVisible ? [0, 0, 0, -34] : [34, 0, 0, -34]);
  const blur = useTransform(progress, at, startVisible ? [0, 0, 0, 6] : [6, 0, 0, 6]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.div
      style={{ opacity, y, filter }}
      className={`pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 lg:inset-x-14 ${
        align === "start" ? "lg:me-auto lg:max-w-xl" : "lg:ms-auto lg:max-w-xl"
      }`}
    >
      <div className="pointer-events-auto">{children}</div>
    </motion.div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-xs tracking-[0.34em] text-brand uppercase">{children}</p>;
}

export function HeroScrolly({ content }: { content: Content }) {
  const container = useRef<HTMLDivElement>(null);
  const { brand, hero, specs, features, proof } = content;

  const originRows = specs.rows.filter((r) =>
    ["Origin", "Producer", "Altitude", "Process"].includes(r.label),
  );
  const notes = specs.rows.find((r) => r.label === "Tasting notes");

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  // Hand the value to the WebGL tree without re-rendering React on every frame.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollState.progress = v;
  });

  // The warm wash tracks the pack across the viewport rather than sitting in one
  // place, so the light appears to belong to the object rather than the page.
  const glowX = useTransform(scrollYProgress, [0, 0.3, 0.56, 0.76, 1], ["30%", "50%", "50%", "68%", "62%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.4, 0.5, 1], [0.85, 1, 1, 0.6]);

  return (
    <section ref={container} className="relative h-[520vh] bg-surface">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: glowOpacity,
            background: useTransform(
              glowX,
              (x) =>
                `radial-gradient(62% 56% at ${x} 48%, rgba(240,164,92,0.26) 0%, rgba(217,148,78,0.10) 40%, rgba(10,8,7,0) 74%)`,
            ),
          }}
        />

        <div className="absolute inset-0 z-10">
          <HeroScene />

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
          {/* 1 — the claim. Pack to the inline start, copy opposite. */}
          <Beat progress={scrollYProgress} at={[0, 0.02, 0.1, 0.15]} align="end" startVisible>
            <Kicker>{brand.name}</Kicker>
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
          </Beat>

          {/* 2 — the farm. Pack centres and turns. */}
          <Beat progress={scrollYProgress} at={[0.17, 0.23, 0.3, 0.35]} align="end">
            <Kicker>{features[0].kicker}</Kicker>
            <h2 className="display mt-5 text-4xl text-ink sm:text-5xl lg:text-6xl">
              {features[0].title}
            </h2>
            <dl className="mt-8 space-y-3 border-s-2 border-brand/60 ps-6">
              {originRows.map((row) => (
                <div key={row.label} className="flex flex-wrap gap-x-3">
                  <dt className="text-sm tracking-[0.14em] text-muted uppercase">{row.label}</dt>
                  <dd className="text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Beat>

          {/* 3 — the inspect beat. Pack fills the frame, so the copy stays short
              and gets out of its way. */}
          <Beat progress={scrollYProgress} at={[0.38, 0.43, 0.5, 0.55]} align="start">
            <Kicker>{notes?.label}</Kicker>
            <p className="display mt-5 text-4xl text-gold sm:text-5xl">{notes?.value}</p>
            <p className="mt-6 max-w-sm leading-relaxed text-muted">{proof[0].statLabel}</p>
            <p className="display mt-1 text-6xl text-ink">{proof[0].statValue}</p>
          </Beat>

          {/* 4 — the reverse. Pack crosses to the inline end, copy follows to
              the start. */}
          <Beat progress={scrollYProgress} at={[0.58, 0.64, 0.71, 0.76]} align="start">
            <Kicker>{features[1].kicker}</Kicker>
            <h2 className="display mt-5 text-4xl text-ink sm:text-5xl lg:text-6xl">
              {features[1].title}
            </h2>
            <p className="mt-6 max-w-prose leading-relaxed text-muted">{features[1].body}</p>
          </Beat>

          {/* 5 — the close. Pack settles small, copy takes the frame. */}
          <Beat progress={scrollYProgress} at={[0.79, 0.85, 0.97, 1]} align="start">
            <Kicker>{features[2].kicker}</Kicker>
            <h2 className="display mt-5 text-4xl text-ink sm:text-5xl lg:text-6xl">
              {features[2].title}
            </h2>
            <p className="mt-6 max-w-prose leading-relaxed text-muted">{features[2].body}</p>
            <a
              href="#launch-list"
              className="mt-8 inline-flex min-h-11 items-center rounded-card border border-edge px-6 py-3 font-medium text-ink transition-colors duration-150 hover:border-brand hover:text-brand"
            >
              {content.capture.submit}
            </a>
          </Beat>
        </div>

        {/* Scroll affordance — the sequence is invisible until someone scrolls,
            so it needs to be obvious that scrolling is the interaction. */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.04], [1, 0]) }}
          className="absolute inset-x-0 bottom-8 z-20 flex justify-center"
        >
          <span className="flex h-10 w-6 justify-center rounded-full border border-edge pt-2">
            <span className="h-2 w-1 rounded-full bg-brand" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}

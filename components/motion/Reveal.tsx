"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * A one-time entrance transition, played when a section first enters the
 * viewport (AC-014).
 *
 * This is the only directory permitted to import the animation library, per
 * SPEC.md §4, and the reason is bundle shape rather than tidiness: marking a
 * whole section `"use client"` to animate it ships every string in that section
 * to the browser twice — once in the server-rendered HTML and again in the
 * client payload. A leaf wrapper animates a subtree that is still server
 * rendered inside it.
 *
 * `once: true` is what makes this an *entrance* rather than an effect. A
 * section that re-animates every time it scrolls back into view is decoration
 * that fires on a gesture the visitor did not make for it.
 *
 * It does not wrap the pinned sequence. That one is scroll-locked — it has no
 * "first enters the viewport" moment and no final state to settle into, which
 * is exactly why AC-014 was narrowed to the sections below it.
 */
export function Reveal({
  children,
  className,
  /** Seconds. Use sparingly — a stagger past ~0.15s reads as a queue, not a group. */
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  // AC-015. Not a shorter animation — no animation, and the final state
  // rendered directly. The global CSS rule collapses transition durations, but
  // this transform is driven by JS and CSS cannot reach it.
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

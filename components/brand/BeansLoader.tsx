import type { CSSProperties } from "react";

/**
 * Three beans, hopping, while the 3D pack loads.
 *
 * ORIGINAL WORK, drawn for this project. It replaces a LottieFiles export whose
 * licence could not be confirmed — see CREDITS.md. Nothing of that asset
 * survives here: different bean count, different geometry, different timing, and
 * a different animation technology.
 *
 * Inline rather than an `<img src>` because vector marks on this site are inline
 * SVG — the same reason `Roundel` is drawn here — and because inline costs no
 * request for something that has to be on screen in the first frame, which is
 * exactly when a second request is least affordable.
 *
 * CSS keyframes rather than SMIL, deliberately. The asset this replaced animated
 * with `animateTransform`, which cannot be paused or slowed from a stylesheet —
 * so the only way to honour reduced motion was to hide the element outright. A
 * CSS animation is reachable by both the `prefers-reduced-motion` block and the
 * accessibility menu's motion switch, which is the difference between a
 * preference that works and one that had to be worked around.
 *
 * The beans still hide rather than freeze under reduced motion (see
 * `.beans-loader` in globals.css). A loader frozen mid-hop reads as a broken
 * page, and nothing is lost by removing it: the poster frame underneath is
 * already showing the product.
 *
 * Each bean is one ellipse and one crease. `currentColor` throughout, so the
 * colour is the caller's business and the mark inherits the gold ramp.
 */
export function BeansLoader({ style }: { style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="beans-loader"
      style={style}
    >
      {/* Rotated a few degrees apart so three copies of one shape do not read
          as a repeated stamp. The hop delay is per-child in globals.css. */}
      {[
        { x: 16, tilt: -24 },
        { x: 36, tilt: -8 },
        { x: 56, tilt: -20 },
      ].map((bean) => (
        <g key={bean.x} className="bean">
          <g transform={`translate(${bean.x} 40) rotate(${bean.tilt})`}>
            <ellipse rx="7.5" ry="10.5" fill="currentColor" />
            {/* The crease. Offset from centre and reversed at the ends, which
                is what stops it reading as a plain seed. */}
            <path
              d="M0.4 -8.6 C3.4 -4.6 -3 4.4 0.4 8.6"
              stroke="var(--color-surface)"
              strokeWidth="1.7"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </g>
      ))}
    </svg>
  );
}

/**
 * The Meridian roundel — the same mark that is printed on the pack.
 *
 * Drawn rather than imported as a bitmap: it appears at 32px and 34px, where a
 * raster mark is either soft on a 2x display or an oversized download for a
 * 32-pixel box. Vector is one request fewer and correct at every density.
 *
 * `currentColor` on purpose, so the nav and the footer tint it from the
 * palette rather than from a baked-in gold that would drift out of step with
 * the tokens.
 */
export function Roundel({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 206 206"
      fill="none"
      role="presentation"
      aria-hidden="true"
      className={className}
      style={{ flexShrink: 0, display: "block" }}
    >
      <circle cx="103" cy="103" r="99" stroke="currentColor" strokeWidth="7" />
      <text
        x="103"
        y="121"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="92"
        fontWeight="500"
        fill="currentColor"
      >
        M
      </text>
      <path d="M103 140v34" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M100 145c-14 4-24 15-26 29 14-2 24-13 26-29z" fill="currentColor" />
      <path d="M106 145c14 4 24 15 26 29-14-2-24-13-26-29z" fill="currentColor" />
    </svg>
  );
}

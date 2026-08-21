import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AC-038. Emits .next/standalone — the server plus only the node_modules it
  // traced as reachable — so the runtime image carries no build toolchain.
  output: "standalone",

  /**
   * This site does no runtime image optimisation, and saying so here is what
   * makes the exclusion below correct rather than a trap.
   *
   * Every raster it serves is pre-encoded by `scripts/`: two poster frames in
   * AVIF, WebP and PNG, and two pack textures in lossless WebP. They are
   * art-directed — a different framing per breakpoint, not a resize — which is
   * a `<picture>` job that `next/image` cannot do. So nothing ever calls the
   * optimiser, and with this set, anything that later did would serve the
   * original instead of failing on a missing sharp.
   */
  images: { unoptimized: true },

  /**
   * SECURITY. Next traces `sharp` into the standalone output unconditionally,
   * whether or not `next/image` is used — it was shipping sharp 0.34.5 plus
   * 20 MB of `@img` libvips binaries into the runtime container, carrying
   * GHSA-f88m-g3jw-g9cj (four libvips CVEs) for a code path nothing reaches.
   *
   * The build-time copy stays: `scripts/panels.mjs` and `scripts/poster.mjs`
   * use sharp directly, and it is a declared devDependency at 0.35.3, which is
   * past that advisory. Only the runtime image loses it.
   */
  outputFileTracingExcludes: {
    "*": ["node_modules/sharp/**", "node_modules/@img/**"],
  },
};

export default nextConfig;

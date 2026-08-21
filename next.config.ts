import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AC-038. Emits .next/standalone — the server plus only the node_modules it
  // traced as reachable — so the runtime image carries no build toolchain.
  output: "standalone",

};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en",
        // Temporary, not permanent. A 308 is cached by the browser indefinitely,
        // which would make locale detection impossible to add later without
        // stranding everyone who ever visited (AC-002).
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

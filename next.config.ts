import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Disable image optimization for simpler deployment
  images: {
    unoptimized: true,
  },

  async redirects() {
    return [
      {
        source: "/wiki",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

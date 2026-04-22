import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.certimaster.io" },
      { protocol: "https", hostname: "localhost" },
    ],
  },
  experimental: {},
};

export default nextConfig;

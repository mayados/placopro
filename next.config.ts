import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true,
  },
  // ...autres options éventuelles
};

export default nextConfig
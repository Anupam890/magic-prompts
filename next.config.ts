import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev }) => {
    config.infrastructureLogging = {
      level: "error",
    };
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;

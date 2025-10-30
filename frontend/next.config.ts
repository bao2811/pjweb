import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  compilerOptions: {
    baseUrl: ".",
    paths: {
      "@/*": ["./src/*/*"],
    },
  },
};

export default nextConfig;

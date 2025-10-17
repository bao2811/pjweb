import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compilerOptions: {
    // ...existing code...
    baseUrl: ".",
    paths: {
      "@/*": ["./src/*/*"],
    },
    // ...existing code...
  },
};

export default nextConfig;

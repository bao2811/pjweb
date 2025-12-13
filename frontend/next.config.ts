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

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jbagy.me",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
    ],
    // Thêm cấu hình này để bỏ qua lỗi khi không load được ảnh
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;

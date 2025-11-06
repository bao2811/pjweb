import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com','i.pravatar.cc'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost/api/:path*', // Proxy to backend via Nginx
      },
    ];
  },
};

export default nextConfig;

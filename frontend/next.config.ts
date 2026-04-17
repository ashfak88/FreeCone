import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'https://freecone.duckdns.org'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

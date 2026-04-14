import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://13.60.254.174:5001/api/:path*",
      },
    ];
  },
};

export default nextConfig;

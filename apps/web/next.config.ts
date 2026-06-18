import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cms/types"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

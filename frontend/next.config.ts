import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-ee54ba2945a04c56b29b01ae5ec3c085.r2.dev",
      },
    ],
  },
  async rewrites() {
    const backendApiBase = (
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BACKEND_API_URL ||
      "http://localhost:4000/api"
    ).replace(/\/$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${backendApiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;

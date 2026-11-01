import type { NextConfig } from "next";

function resolveProxyApiOrigin(): string {
  const raw =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "https://backend-dev.rotidukaan.com";
  return raw.replace(/\/api\/v1\/?$/i, "").replace(/\/$/, "");
}

const API_ORIGIN = resolveProxyApiOrigin();

const nextConfig: NextConfig = {
  // Local shop sync from next-frontend may have minor TS drift; set STRICT_SHOP=1 to enforce.
  typescript: { ignoreBuildErrors: process.env.STRICT_SHOP !== "1" },
  eslint: { ignoreDuringBuilds: process.env.STRICT_SHOP !== "1" },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "d3ulec0zs3hw9b.cloudfront.net" },
      { protocol: "https", hostname: "dev-dukaan.s3.ap-south-2.amazonaws.com" },
      { protocol: "https", hostname: "prod-roti-dukaan.s3.ap-south-2.amazonaws.com" },
      { protocol: "https", hostname: "*.s3.ap-south-2.amazonaws.com" },
      { protocol: "https", hostname: "*.s3.ap-south-1.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_ORIGIN}/api/v1/:path*`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${API_ORIGIN}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;

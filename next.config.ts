import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "d3ulec0zs3hw9b.cloudfront.net" },
      { protocol: "https", hostname: "*.s3.ap-south-2.amazonaws.com" },
      { protocol: "https", hostname: "*.s3.ap-south-1.amazonaws.com" },
    ],
  },
};

export default nextConfig;

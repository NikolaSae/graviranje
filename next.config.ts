import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Base64 slike umeju da budu velike
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;

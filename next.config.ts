import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Cover-image uploads go through a server action; phone photos exceed the 1MB default.
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;

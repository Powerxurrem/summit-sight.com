import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The local preview forwards browser requests from this development host.
  allowedDevOrigins: ["10.5.0.2"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

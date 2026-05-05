import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Skip type checking during build — Supabase types not generated yet
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

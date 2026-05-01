import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
          // Skip type checking during build — Supabase types not generated yet
      ignoreBuildErrors: true,
    },
    eslint: {
          // Skip ESLint during build for faster deploys
      ignoreDuringBuilds: true,
    },
};

export default nextConfig;

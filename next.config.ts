import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep file tracing scoped to this app when a parent directory has a lockfile.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone', // Required for Docker deployment
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Allow larger file uploads
    },
  },
};

export default nextConfig;

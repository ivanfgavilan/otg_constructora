import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Garantizar que bcryptjs (pure JS, sin binarios nativos) sea incluido en el bundle
  serverExternalPackages: [],
  outputFileTracingIncludes: {
    '/**': ['./node_modules/bcryptjs/**'],
  },
};

export default nextConfig;

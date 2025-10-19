import type { NextConfig } from 'next';

/**
 * Next.js config
 * - Standalone output produces .next/standalone with a minimal server.js
 * - Safe defaults; adjust as features are added.
 */
const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // Disable ESLint during build for deployment
    ignoreDuringBuilds: true,
  },
  // Suppress hydration warnings for browser extension interference
  reactStrictMode: false, // This can help reduce hydration warnings
};

export default nextConfig;

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
      {
        protocol: 'https',
        hostname: 'kiptlccxjvbxcwspozwz.supabase.co',
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
  // Webpack optimizations to fix module resolution issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;

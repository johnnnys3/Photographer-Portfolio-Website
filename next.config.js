/**
 * MIGRATION NOTE:
 * Source: vite.config.ts
 * Destination: next.config.js
 * This configuration maps Vite settings to Next.js equivalent.
 * Any deviation is unintentional and should be flagged.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Map Vite's target: 'esnext' to Next.js
  experimental: {
    // Enable modern JavaScript features
  },
  
  // Fix for Turbopack - empty config to silence warning
  turbopack: {},
  
  // Map Vite's CSP headers to Next.js
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://jblkonraedwcjbllpqap.supabase.co wss://jblkonraedwcjbllpqap.supabase.co;"
          }
        ]
      }
    ]
  },

  // Path mapping from Vite alias to Next.js - updated for Turbopack compatibility
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src'
    };
    return config;
  },

  // Image optimization for production - updated to use remotePatterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jblkonraedwcjbllpqap.supabase.co',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  }
};

module.exports = nextConfig;

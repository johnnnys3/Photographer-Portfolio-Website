/**
 * MIGRATION NOTE:
 * Source: vite.config.ts
 * Destination: next.config.js
 * This configuration maps Vite settings to Next.js equivalent.
 * Any deviation is unintentional and should be flagged.
 */

// Derived from the env var so the CSP and image host follow whichever Supabase project is configured.
const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://missing.supabase.co').host;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a verification build (NEXT_DIST_DIR=.next-verify) run beside `next dev` without clobbering it.
  distDir: process.env.NEXT_DIST_DIR || '.next',

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
            value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://${supabaseHost} wss://${supabaseHost};`
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
        hostname: supabaseHost,
      },
    ],
    // WebP only: AVIF takes far longer to encode on the first visit. A year-long cache means each
    // resized photo is made once, which also keeps Supabase egress and Vercel image quota low.
    formats: ['image/webp'],
    minimumCacheTTL: 31536000,
  }
};

module.exports = nextConfig;

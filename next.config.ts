import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Loaded from node_modules at runtime rather than bundled: both ship native
  // pieces (WASM for PGlite, a fetch wrapper for Neon) that must resolve their
  // own assets from disk.
  serverExternalPackages: ['@electric-sql/pglite', '@neondatabase/serverless'],
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {hostname: "cdn.sanity.io"},
      {hostname: "munchies.medusajs.app"},
      {hostname: "tinloof-munchies.s3.eu-north-1.amazonaws.com"},
      {hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com"},
      {hostname: "s3.eu-central-1.amazonaws.com"},
      {hostname: "pub-b058bbb844bb4def9947d1a87d697d2c.r2.dev"},
    ],
    formats: ["image/avif", "image/webp"],
  },
  eslint: {
    /// Set this to false if you want production builds to abort if there's lint errors
    ignoreDuringBuilds: process.env.VERCEL_ENV === "production",
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    taint: true,
  },
  // Simplified rewrites for India-only store
  rewrites() {
    return [
      // Exclude specific paths from rewrites
      {
        source: '/cms/:path*',
        destination: '/cms/:path*',
      },
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },

      // Map all other paths to India region
      {
        source: '/:path*',
        destination: '/in/:path*',
      }
    ];
  },
};

export default config;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as standalone for Vercel deployment
  output: 'standalone',

  // Disable type checking during build (already done in CI)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

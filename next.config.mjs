/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as standalone for Vercel deployment
  // output: 'standalone',

  // Disable type checking during build (already done in CI)
  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    const normalizedBackendBaseUrl = backendBaseUrl.replace(/\/$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${normalizedBackendBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

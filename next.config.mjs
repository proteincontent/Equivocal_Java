/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as standalone for Vercel deployment
  // output: 'standalone',

  // Disable type checking during build (already done in CI)
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-940ccf6255b54fa799a9b01050e6c227.r2.dev",
      },
    ],
  },

  async rewrites() {
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";
    const normalizedBackendBaseUrl = backendBaseUrl.replace(/\/$/, "");
    // Windows 上 8000 端口可能被系统排除（Excluded Port Range），默认改为 8100
    const aiAgentBaseUrl = process.env.NEXT_PUBLIC_AI_AGENT_URL ?? "http://127.0.0.1:8100";
    const normalizedAiAgentBaseUrl = aiAgentBaseUrl.replace(/\/$/, "");

    return [
      // Bypass route for direct AI Agent access (skipping Java backend)
      {
        source: "/api/bypass/chat",
        destination: `${normalizedAiAgentBaseUrl}/v1/chat/completions`,
      },
      // Contract review should hit AI Agent (not Java backend)
      {
        source: "/api/contract/review",
        destination: `${normalizedAiAgentBaseUrl}/v1/contract/review`,
      },
      {
        source: "/api/:path*",
        destination: `${normalizedBackendBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

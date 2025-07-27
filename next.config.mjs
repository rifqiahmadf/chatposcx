/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      // Removed /api/run rewrite since we're handling it directly in the route handler
      // {
      //   source: "/api/run",
      //   destination: "http://10.24.1.43:5001/run",
      // },
      {
        source: "/api/proxy/:userId/:sessionId",
        destination:
          "http://10.24.1.43:5001/apps/master_ips_agent/users/:userId/sessions/:sessionId",
      },
    ];
  },
};

export default nextConfig;

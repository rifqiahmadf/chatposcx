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
      {
        source: '/api/run',
        destination: 'http://10.24.1.43:3003/run',
      },
      {
        source: '/api/proxy/:userId/:sessionId',
        destination: 'http://10.24.1.43:3003/apps/multi_tool_agent/users/:userId/sessions/:sessionId',
      },
    ]
  },
}

export default nextConfig

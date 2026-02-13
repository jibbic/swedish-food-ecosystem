import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    allowedDevOrigins: ['192.168.1.12'],
  },
}

export default nextConfig

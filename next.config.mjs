/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  allowedDevOrigins: ['mathematics-mainly-korean-ranking.trycloudflare.com'],
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    scrollRestoration: true,
  },
}

export default nextConfig

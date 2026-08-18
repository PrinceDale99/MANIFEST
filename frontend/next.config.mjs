/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Environment variables are loaded from .env.local (development)
  // and Vercel Environment Variables (production)
  // Do NOT hardcode env vars here — use Vercel dashboard or .env.local

  // Output standalone for Docker/Vercel
  output: 'standalone',

  // Optimize images
  images: {
    remotePatterns: [],
  },

  // Headers for CORS (proof server)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
}

export default nextConfig

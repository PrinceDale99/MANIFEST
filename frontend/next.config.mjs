/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_PROOF_SERVER_URL:
      process.env.NEXT_PUBLIC_PROOF_SERVER_URL || 'http://localhost:6300',
    NEXT_PUBLIC_NETWORK:
      process.env.NEXT_PUBLIC_NETWORK || 'preview',
  },
}

export default nextConfig

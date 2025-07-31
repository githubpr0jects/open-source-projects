/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['opengraph.githubassets.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://lb2-twitter-api.opensourceprojects.dev/:path*',
      },
    ]
  },
}

module.exports = nextConfig
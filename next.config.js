/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://twitter-api.opensourceprojects.dev/:path*',
      },
    ]
  },
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/tweet-metrics',
        destination: 'https://twitter-api.opensourceprojects.dev/tweet-metrics',
      },
      {
        source: '/api/multiple-tweet-metrics',
        destination: 'https://twitter-api.opensourceprojects.dev/multiple-tweet-metrics',
      },
      {
        source: '/api/:path*',
        destination: 'https://twitter-api.opensourceprojects.dev/:path*',
      },
    ]
  },
}

module.exports = nextConfig
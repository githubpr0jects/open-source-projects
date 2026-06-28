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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
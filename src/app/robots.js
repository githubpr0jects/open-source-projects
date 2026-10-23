const SITE_URL = 'https://www.opensourceprojects.dev';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Don't block /_next/: Googlebot needs the JS and CSS there to render pages.
        disallow: [
          '/api/',
          '/bookmarks',
          '/tracking/',
          '/analytics/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
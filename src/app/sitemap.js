const SITE_URL = 'https://www.opensourceprojects.dev';
const API_URL = 'https://lb2-twitter-api.opensourceprojects.dev';

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap() {
  // Static pages
  const staticRoutes = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/newsletter`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/sponsor-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/rss-info`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic post pages — fetch all pages of threads
  const postRoutes = [];
  let page = 1;
  let hasMore = true;
  const MAX_PAGES = 20; // Safety limit — covers most recent ~200 posts at build; ISR picks up the rest

  while (hasMore && page <= MAX_PAGES) {
    try {
      const response = await fetch(`${API_URL}/threads?type=github&page=${page}`, {
        next: { revalidate: 3600 },
      });
      if (!response.ok) break;
      const data = await response.json();
      const threads = data?.threads || [];
      if (threads.length === 0) break;

      for (const thread of threads) {
        if (thread.conversation_id) {
          postRoutes.push({
            url: `${SITE_URL}/post/${thread.conversation_id}`,
            lastModified: thread.date ? new Date(thread.date) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }

      const pagination = data?.pagination;
      hasMore = pagination?.has_next === true;
      page++;
    } catch (error) {
      console.error(`Sitemap: failed to fetch page ${page}:`, error.message);
      break;
    }
  }

  return [...staticRoutes, ...postRoutes];
}
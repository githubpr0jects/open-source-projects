const SITE_URL = 'https://www.opensourceprojects.dev';
const API_URL = 'https://lb2-twitter-api.opensourceprojects.dev';

export const revalidate = 3600; // Revalidate sitemap every hour

const PER_PAGE = 100; // Backend max page size
const MAX_PAGES = 500; // Safety limit — 50,000 URLs, the sitemap protocol maximum
const CONCURRENCY = 5;

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

  // Dynamic post pages — every post, not just the latest few hundred. Posts that
  // fall out of the sitemap have no other crawlable path and drop out of the index.
  const fetchThreadsPage = async (page) => {
    const response = await fetch(`${API_URL}/threads?type=github&page=${page}&limit=${PER_PAGE}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };

  const toRoute = (thread) => ({
    url: `${SITE_URL}/post/${thread.conversation_id}`,
    lastModified: thread.date ? new Date(thread.date) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  });

  const postRoutes = [];
  try {
    const first = await fetchThreadsPage(1);
    const totalPages = Math.min(first?.pagination?.total_pages || 1, MAX_PAGES);
    const pages = [first];

    for (let page = 2; page <= totalPages; page += CONCURRENCY) {
      const batch = [];
      for (let p = page; p < page + CONCURRENCY && p <= totalPages; p++) {
        batch.push(fetchThreadsPage(p));
      }
      pages.push(...(await Promise.all(batch)));
    }

    for (const data of pages) {
      for (const thread of data?.threads || []) {
        if (thread.conversation_id) postRoutes.push(toRoute(thread));
      }
    }
  } catch (error) {
    // Fail the revalidation rather than publish a truncated sitemap; the last
    // good sitemap keeps being served until the backend recovers.
    console.error('Sitemap: failed to fetch threads:', error.message);
    throw error;
  }

  return [...staticRoutes, ...postRoutes];
}
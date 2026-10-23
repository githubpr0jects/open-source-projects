import { HomePageWrapper } from './page-client';

const SITE_URL = 'https://www.opensourceprojects.dev';
const API_URL = 'https://lb2-twitter-api.opensourceprojects.dev';

// Fetch the listing on the server so the HTML Googlebot receives already links to
// every post on the page. Returns null on failure and the client fetches instead.
async function fetchInitialThreads({ page, search, sort }) {
  try {
    const params = new URLSearchParams({ type: 'github' });
    if (page > 1) params.append('page', String(page));
    if (search) params.append('search', search);
    if (sort && sort !== 'latest') params.append('sort', sort);

    const response = await fetch(`${API_URL}/threads?${params.toString()}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data?.threads) ? data : null;
  } catch (error) {
    console.error('Home: failed to fetch threads:', error.message);
    return null;
  }
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params?.page) || 1;
  const hasSearch = !!params?.search;
  const hasSort = params?.sort && params.sort !== 'latest';

  // Noindex search and sort filter URLs — they create duplicate content
  const shouldNoIndex = hasSearch || hasSort;

  // Self-referencing canonical for pagination; homepage canonical for page 1
  const canonical = page > 1 ? `${SITE_URL}/?page=${page}` : SITE_URL;

  const metadata = {
    title: page > 1
      ? `Open Source Projects — Page ${page} | Open-source Projects`
      : 'Discover the Best Open Source Projects | Open-source Projects',
    description: 'Explore our curated collection of the best open-source projects from GitHub. Find trending repositories, hidden gems, and amazing developer tools. Discover projects in JavaScript, Python, React, Node.js, and more.',
    keywords: [
      'open source projects',
      'github repositories',
      'best open source',
      'trending repositories',
      'developer tools',
      'programming projects',
      'software development',
      'code repositories',
      'github trending',
      'open source software',
      'free software',
      'developer resources'
    ],
    openGraph: {
      title: 'Discover the Best Open Source Projects',
      description: 'Explore our curated collection of the best open-source projects from GitHub. Find trending repositories, hidden gems, and amazing developer tools.',
      url: canonical,
      siteName: 'Open-source Projects',
      images: [
        {
          url: `${SITE_URL}/images/open-source-logo-830x460.jpg`,
          width: 1200,
          height: 630,
          alt: 'Open-source Projects - Discover the Best Open Source Projects',
          type: 'image/jpeg',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Discover the Best Open Source Projects',
      description: 'Explore our curated collection of the best open-source projects from GitHub. Find trending repositories and hidden gems.',
      images: [`${SITE_URL}/images/open-source-logo-830x460.jpg`],
      creator: '@opensourceprojects',
      site: '@opensourceprojects',
    },
    // Next.js drops the query string from canonicals on "/", so paginated pages
    // render their own <link rel="canonical"> in HomePage instead.
    ...(page === 1 && { alternates: { canonical } }),
    applicationName: 'Open-source Projects',
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
  };

  if (shouldNoIndex) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }

  return metadata;
}

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params?.page) || 1;
  const data = await fetchInitialThreads({
    page,
    search: params?.search?.trim() || '',
    sort: params?.sort || 'latest',
  });

  return (
    <>
      {/* React hoists this into <head> */}
      {page > 1 && <link rel="canonical" href={`${SITE_URL}/?page=${page}`} />}
      <HomePageWrapper
        initialPosts={data?.threads ?? null}
        initialPagination={data?.pagination ?? null}
      />
    </>
  );
}
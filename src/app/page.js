import { HomePageWrapper } from './page-client';

const SITE_URL = 'https://www.opensourceprojects.dev';

export function generateMetadata({ searchParams }) {
  const params = typeof searchParams?.then === 'function' ? null : searchParams;
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
    alternates: {
      canonical,
    },
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

export default function HomePage() {
  return <HomePageWrapper />;
}
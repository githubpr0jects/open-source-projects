import HomePageClient from './HomePageClient';

const SITE_URL = 'https://www.opensourceprojects.dev';

// Generate metadata specifically for the home page
export const metadata = {
  title: 'Discover the Best Open Source Projects | Open-source Projects',
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
  
  // Open Graph metadata for social sharing
  openGraph: {
    title: 'Discover the Best Open Source Projects',
    description: 'Explore our curated collection of the best open-source projects from GitHub. Find trending repositories, hidden gems, and amazing developer tools.',
    url: SITE_URL,
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
  
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Discover the Best Open Source Projects',
    description: 'Explore our curated collection of the best open-source projects from GitHub. Find trending repositories and hidden gems.',
    images: [`${SITE_URL}/images/open-source-logo-830x460.jpg`],
    creator: '@opensourceprojects',
    site: '@opensourceprojects',
  },
  
  // Additional structured data
  other: {
    'og:site_name': 'Open-source Projects',
    'article:section': 'Technology',
    'og:type': 'website',
    'theme-color': '#000000',
    'msapplication-TileColor': '#000000',
  },
  
  // Canonical URL
  alternates: {
    canonical: SITE_URL,
  },
  
  // App specific metadata
  applicationName: 'Open-source Projects',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
};

// Server component for the home page
export default async function HomePage({ searchParams }) {
  const { HomePageContent } = await import('./page-client');
  return <HomePageContent />;
}

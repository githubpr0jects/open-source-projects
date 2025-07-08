import HomePageClient from './HomePageClient';

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
    url: 'https://opensourceprojects.dev',
    siteName: 'Open-source Projects',
    images: [
      {
        url: 'https://opensourceprojects.dev/images/open-source-logo-830x460.jpg',
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
    images: ['https://opensourceprojects.dev/images/open-source-logo-830x460.jpg'],
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
    canonical: 'https://opensourceprojects.dev',
  },
  
  // JSON-LD structured data for better SEO
  additionalMetaTags: [
    {
      name: 'application-name',
      content: 'Open-source Projects'
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'default'
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'Open-source Projects'
    },
    {
      name: 'format-detection',
      content: 'telephone=no'
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'msapplication-TileColor',
      content: '#000000'
    },
    {
      name: 'msapplication-tap-highlight',
      content: 'no'
    },
    {
      name: 'theme-color',
      content: '#000000'
    }
  ]
};

// Generate viewport for the home page
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// Server component for the home page
export default async function HomePage({ searchParams }) {
  // Extract page from search params
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  
  // Fetch initial data server-side for better SEO
  let initialData = null;
  try {
    const url = page === 1 
      ? 'https://twitter-api.opensourceprojects.dev/threads?type=github'
      : `https://twitter-api.opensourceprojects.dev/threads?type=github&page=${page}`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });
    
    if (response.ok) {
      initialData = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
  }
  
  return <HomePageClient initialData={initialData} currentPage={page} />;
}

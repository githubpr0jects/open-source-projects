export const metadata = {
  title: 'RSS Feed Information | Open-source Projects',
  description: 'Subscribe to our RSS and Atom feeds to stay updated with the latest open-source project discoveries. Get instant notifications when new projects are featured.',
  keywords: [
    'RSS feed',
    'Atom feed',
    'open source RSS',
    'project updates',
    'subscribe',
    'feed reader',
    'syndication',
    'news feed',
    'open source news',
    'project notifications'
  ],
  
  // Open Graph metadata
  openGraph: {
    title: 'RSS Feed Information | Open-source Projects',
    description: 'Subscribe to our RSS and Atom feeds to stay updated with the latest open-source project discoveries. Get instant notifications when new projects are featured.',
    type: 'website',
    url: 'https://opensourceprojects.dev/rss-info',
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary',
    title: 'RSS Feed Information | Open-source Projects',
    description: 'Subscribe to our RSS and Atom feeds to stay updated with the latest open-source project discoveries.',
  },
  
  // Additional meta tags
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/rss', title: 'Open-source Projects RSS Feed' }
      ],
      'application/atom+xml': [
        { url: '/feed.xml', title: 'Open-source Projects Atom Feed' }
      ]
    }
  }
};

export default function RSSInfoLayout({ children }) {
  return children;
}

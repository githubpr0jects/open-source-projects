export const metadata = {
  title: 'Newsletter Signup | Open-source Projects',
  description: 'Join our newsletter to stay updated with the latest open-source projects, news, and insights. Get curated content delivered directly to your inbox.',
  keywords: [
    'newsletter',
    'open source newsletter',
    'subscribe',
    'email updates',
    'project news',
    'developer newsletter',
    'coding newsletter',
    'open source updates',
    'programming news',
    'software development'
  ],
  
  // Open Graph metadata
  openGraph: {
    title: 'Newsletter Signup | Open-source Projects',
    description: 'Join our newsletter to stay updated with the latest open-source projects, news, and insights. Get curated content delivered directly to your inbox.',
    type: 'website',
    url: 'https://opensourceprojects.dev/newsletter',
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary',
    title: 'Newsletter Signup | Open-source Projects',
    description: 'Join our newsletter to stay updated with the latest open-source projects, news, and insights.',
  },
  
  // Additional meta tags for newsletter signup
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  }
};

export default function NewsletterLayout({ children }) {
  return children;
}

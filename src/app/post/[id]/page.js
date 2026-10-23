import PostPageClient from './PostPageClient';
import { notFound } from 'next/navigation';

const fallbackImage = '/images/open-source-logo-830x460.jpg';
const SITE_URL = 'https://www.opensourceprojects.dev';

const getHeroImage = (post) => {
  return post.github_card_image || fallbackImage;
};

const getProjectTitle = (content) => {
  const firstLine = content.split('\n')[0];
  // Remove URLs from the title
  const titleWithoutUrls = firstLine.replace(/https?:\/\/[^\s]+/g, '').trim();
  const cleanTitle = titleWithoutUrls || 'Open Source Project';
  return cleanTitle.length > 80 ? cleanTitle.substring(0, 80) + '...' : cleanTitle;
};

const extractTags = (content) => {
  // Extract hashtags from content
  const hashtagRegex = /#(\w+)/g;
  const hashtags = content.match(hashtagRegex) || [];
  return hashtags.map(tag => tag.substring(1)); // Remove the # symbol
};

// Function to clean content for description
const cleanContentForDescription = (content) => {
  return content
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/#\w+/g, '') // Remove hashtags
    .replace(/\n+/g, ' ') // Replace line breaks with spaces
    .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
    .trim();
};

// Server-side function to fetch post details.
// Returns null only when the backend says the post doesn't exist (→ real 404).
// Any other failure throws, so ISR keeps serving the last good copy instead of
// caching a "not found" page (with noindex) for a post that does exist.
async function fetchPostDetails(id) {
  const response = await fetch(`https://lb2-twitter-api.opensourceprojects.dev/threads/${encodeURIComponent(id)}`, {
    next: { revalidate: 3600 }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch post ${id}: HTTP ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) && data.length > 0 ? data : null;
}

// Short-code URLs (/post/<slug>) serve the same thread as /post/<conversation_id>,
// so point every variant at the conversation_id URL the sitemap lists.
const getCanonicalUrl = (postDetails, id) => {
  const rootPost = postDetails.find(post => !post.parent_id) || postDetails[0];
  return `${SITE_URL}/post/${rootPost?.id || id}`;
};

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const postDetails = await fetchPostDetails(resolvedParams.id);
  
  if (!postDetails) {
    return {
      title: 'Project Not Found',
      description: 'The project you are looking for could not be found.',
      robots: {
        index: false,
        follow: true,
      },
      openGraph: {
        title: 'Project Not Found | Open-source Projects',
        description: 'The project you are looking for could not be found.',
        images: ['/images/open-source-logo-830x460.jpg'],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Project Not Found | Open-source Projects',
        description: 'The project you are looking for could not be found.',
        images: ['/images/open-source-logo-830x460.jpg'],
      },
    };
  }

  const mainPost = postDetails[0];
  const title = getProjectTitle(mainPost.content);
  const heroImage = getHeroImage(mainPost);
  
  // Create a clean description from the content
  const cleanContent = cleanContentForDescription(mainPost.content);
  const description = cleanContent.length > 160 
    ? cleanContent.substring(0, 157) + '...' 
    : cleanContent || 'Discover this amazing open-source project and join the community.';

  const tags = extractTags(mainPost.content);
  const keywords = [
    'open source',
    'github',
    'programming',
    'development',
    'software',
    ...tags
  ].join(', ');

  const currentUrl = getCanonicalUrl(postDetails, resolvedParams.id);
  
  // Ensure absolute URL for images
  const absoluteImageUrl = heroImage.startsWith('http') 
    ? heroImage 
    : `${SITE_URL}${heroImage}`;

  return {
    // The root layout's title template appends "| Open-source Projects"
    title,
    description,
    keywords,
    
    // Open Graph metadata for Facebook, LinkedIn, etc.
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: 'Open-source Projects',
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/jpeg',
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: mainPost.date,
      modifiedTime: postDetails[postDetails.length - 1]?.date || mainPost.date,
      authors: [`@${mainPost.username}`],
      tags: tags,
      section: 'Technology',
    },
    
    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImageUrl],
      creator: `@${mainPost.username}`,
      site: '@opensourceprojects',
    },
    
    // Additional metadata for better SEO
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Schema.org structured data
    other: {
      'article:author': `@${mainPost.username}`,
      'article:published_time': mainPost.date,
      'article:modified_time': postDetails[postDetails.length - 1]?.date || mainPost.date,
      'article:section': 'Technology',
      'article:tag': tags.join(','),
      'og:updated_time': postDetails[postDetails.length - 1]?.date || mainPost.date,
      'twitter:label1': 'Written by',
      'twitter:data1': `@${mainPost.username}`,
      'twitter:label2': 'Reading time',
      'twitter:data2': `${Math.max(1, Math.round((cleanContent.split(/\s+/).length || 100) / 200))} min read`,
      'twitter:image:alt': title,
      'theme-color': '#000000',
      'msapplication-TileColor': '#000000',
      'linkedin:owner': 'Open-source Projects',
      'og:type': 'article',
      'og:site_name': 'Open-source Projects',
    },
    
    // Canonical URL
    alternates: {
      canonical: currentUrl,
    },
    
    // App specific metadata
    applicationName: 'Open-source Projects',
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    
    // Language and locale
    metadataBase: new URL(SITE_URL),
  };
}

// Separate viewport export as required by Next.js 15
export async function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1.0,
  };
}

// Prerender the most recent post pages at build time so Googlebot gets static HTML
export async function generateStaticParams() {
  try {
    const response = await fetch('https://lb2-twitter-api.opensourceprojects.dev/threads?type=github&page=1', {
      next: { revalidate: 86400 }
    });
    if (!response.ok) return [];
    const data = await response.json();
    const threads = data?.threads || [];
    return threads.map(post => ({
      id: String(post.conversation_id),
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

export default async function PostPage({ params }) {
  const resolvedParams = await params;
  const postDetails = await fetchPostDetails(resolvedParams.id);
  
  // Return a real 404 (not a soft 404 with HTTP 200) when the post doesn't exist
  if (!postDetails) {
    notFound();
  }

  const mainPost = postDetails[0];
  const title = getProjectTitle(mainPost.content);
  const heroImage = getHeroImage(mainPost);
  const absoluteImageUrl = heroImage.startsWith('http') ? heroImage : `${SITE_URL}${heroImage}`;
  const currentUrl = getCanonicalUrl(postDetails, resolvedParams.id);
  const modifiedDate = postDetails[postDetails.length - 1]?.date || mainPost.date;
  const tags = extractTags(mainPost.content);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    image: [absoluteImageUrl],
    datePublished: mainPost.date,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: `@${mainPost.username}`,
      url: `https://www.opensourceprojects.dev`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Open-source Projects',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.opensourceprojects.dev/images/open-source-logo-830x460.jpg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
    articleSection: 'Technology',
    keywords: tags.join(', '),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.opensourceprojects.dev/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title,
        item: currentUrl,
      },
    ],
  };
   
  // Pass the data to the client component, with JSON-LD structured data for rich results
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PostPageClient postDetails={postDetails} params={resolvedParams} />
    </>
  );
}

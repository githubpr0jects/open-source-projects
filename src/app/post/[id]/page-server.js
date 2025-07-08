import PostPageClient from './PostPageClient';

const fallbackImage = '/images/open-source-logo-830x460.jpg';

const getHeroImage = (post) => {
  return post.github_card_image || fallbackImage;
};

const getProjectTitle = (content) => {
  const firstLine = content.split('\n')[0];
  return firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine || 'Open Source Project';
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

// Server-side function to fetch post details
async function fetchPostDetails(id) {
  try {
    const response = await fetch(`https://twitter-api.opensourceprojects.dev/threads/${id}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch post details');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching post details:', error);
    return null;
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }) {
  const postDetails = await fetchPostDetails(params.id);
  
  if (!postDetails || postDetails.length === 0) {
    return {
      title: 'Project Not Found | Open-source Projects',
      description: 'The project you are looking for could not be found.',
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

  // Get the current URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://opensourceprojects.dev';
  const currentUrl = `${baseUrl}/post/${params.id}`;
  
  // Ensure absolute URL for images
  const absoluteImageUrl = heroImage.startsWith('http') 
    ? heroImage 
    : `${baseUrl}${heroImage}`;

  return {
    title: `${title} | Open-source Projects`,
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
      site: '@opensourceprojects', // Update with your Twitter handle
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
      // Article schema
      'article:author': `@${mainPost.username}`,
      'article:published_time': mainPost.date,
      'article:section': 'Technology',
      'article:tag': tags.join(','),
      
      // Additional meta tags
      'og:updated_time': postDetails[postDetails.length - 1]?.date || mainPost.date,
      'theme-color': '#000000',
      'msapplication-TileColor': '#000000',
      
      // LinkedIn specific
      'linkedin:owner': 'Open-source Projects',
      
      // WhatsApp and Telegram sharing
      'og:type': 'article',
      'og:site_name': 'Open-source Projects',
    },
    
    // Canonical URL
    alternates: {
      canonical: currentUrl,
    },
    
    // Viewport and mobile optimization
    viewport: 'width=device-width, initial-scale=1.0',
    
    // App specific metadata
    applicationName: 'Open-source Projects',
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    
    // Language and locale
    metadataBase: new URL(baseUrl),
  };
}

export default async function PostPage({ params }) {
  const postDetails = await fetchPostDetails(params.id);
  
  // Pass the data to the client component
  return <PostPageClient postDetails={postDetails} params={params} />;
}

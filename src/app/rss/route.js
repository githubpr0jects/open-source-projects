import { NextResponse } from 'next/server';

// RSS feed generator for open-source projects
export async function GET() {
  let projects = null;
  
  try {
    // First, try fetching data from your existing API
    console.log('Fetching RSS data from API...');
    const response = await fetch('https://twitter-api.opensourceprojects.dev/threads?type=github', {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'User-Agent': 'Open Source Projects RSS Generator/1.0',
        'Accept': 'application/json',
      }
    });

    console.log('API Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Raw API response keys:', Object.keys(data));
      
      // Handle the response structure - it contains a 'threads' array
      if (data && data.threads && Array.isArray(data.threads)) {
        projects = data.threads;
        console.log('Successfully fetched projects from API:', projects.length);
      } else {
        console.warn('Unexpected API response structure:', data);
        throw new Error('API response does not contain expected threads array');
      }
    } else {
      console.warn('Primary API failed, trying alternative approach...');
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

  } catch (error) {
    console.error('Primary API failed:', error.message);
    
    // Fallback: Try to fetch from your own homepage API if it exists
    try {
      console.log('Trying fallback method...');
      // You can add a fallback URL here or use static data
      // For now, we'll create a minimal RSS with error info
      projects = null;
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError.message);
      projects = null;
    }
  }

  try {
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      console.warn('No projects data available, creating minimal RSS');
      
      // Create a minimal RSS feed with placeholder content
      const minimalRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Open Source Projects - Latest Discoveries</title>
    <description>Discover the best open-source projects from GitHub. Curated collection of trending repositories, hidden gems, and amazing developer tools.</description>
    <link>https://opensourceprojects.dev</link>
    <atom:link href="https://opensourceprojects.dev/rss" rel="self" type="application/rss+xml" />
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>hello@opensourceprojects.dev (Open Source Projects)</managingEditor>
    <webMaster>hello@opensourceprojects.dev (Open Source Projects)</webMaster>
    <generator>Open Source Projects RSS Generator</generator>
    <ttl>300</ttl>
    <image>
      <url>https://opensourceprojects.dev/images/open-source-logo-830x460.jpg</url>
      <title>Open Source Projects - Latest Discoveries</title>
      <link>https://opensourceprojects.dev</link>
      <width>144</width>
      <height>144</height>
      <description>Discover the best open-source projects from GitHub</description>
    </image>
    <item>
      <title>RSS Feed Temporarily Unavailable</title>
      <description><![CDATA[The RSS feed is temporarily unavailable due to API issues. Please visit <a href="https://opensourceprojects.dev">opensourceprojects.dev</a> to see the latest open-source projects.]]></description>
      <link>https://opensourceprojects.dev</link>
      <guid isPermaLink="true">https://opensourceprojects.dev/rss-unavailable</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

      return new NextResponse(minimalRss, {
        status: 200,
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=60, s-maxage=60', // Shorter cache when there's an issue
        },
      });
    }

    // Generate RSS XML with actual data
    const rssXml = generateRSSXML(projects);

    // Return RSS response with proper headers
    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('RSS generation error:', error);
    
    // Return error RSS feed with more details
    const errorRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Open Source Projects - Error</title>
    <description>Error generating RSS feed: ${error.message}</description>
    <link>https://opensourceprojects.dev</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <item>
      <title>RSS Feed Error</title>
      <description>Unable to generate RSS feed at this time. Error: ${error.message}. Please try again later.</description>
      <link>https://opensourceprojects.dev</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

    return new NextResponse(errorRss, {
      status: 500,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    });
  }
}

function generateRSSXML(projects) {
  const siteUrl = 'https://opensourceprojects.dev';
  const feedTitle = 'Open Source Projects - Latest Discoveries';
  const feedDescription = 'Discover the best open-source projects from GitHub. Curated collection of trending repositories, hidden gems, and amazing developer tools.';
  
  // Helper function to clean and escape text for XML
  const escapeXML = (text) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // Helper function to extract project title from content
  const getProjectTitle = (content) => {
    if (!content) return 'Open Source Project';
    const firstLine = content.split('\n')[0];
    // Remove URLs from the title
    const titleWithoutUrls = firstLine.replace(/https?:\/\/[^\s]+/g, '').trim();
    const cleanTitle = titleWithoutUrls || 'Open Source Project';
    return cleanTitle.length > 100 ? cleanTitle.substring(0, 100) + '...' : cleanTitle;
  };

  // Helper function to extract description from markdown or content
  const getDescription = (project) => {
    // Try to get description from markdown content first
    if (project.markdown_content && project.markdown_content.trim()) {
      // Extract first paragraph or intro section
      const lines = project.markdown_content.split('\n').filter(line => line.trim());
      for (const line of lines) {
        if (line.trim() && !line.startsWith('#') && line.length > 50) {
          return line.trim().length > 300 ? line.trim().substring(0, 300) + '...' : line.trim();
        }
      }
    }
    
    // Fallback to regular content
    if (project.content) {
      const cleanContent = project.content.replace(/https?:\/\/[^\s]+/g, '').trim();
      return cleanContent.length > 300 ? cleanContent.substring(0, 300) + '...' : cleanContent;
    }
    
    return 'Discover this amazing open-source project on GitHub.';
  };

  // Helper function to extract tags/categories
  const getTags = (content) => {
    if (!content) return [];
    const hashtagRegex = /#(\w+)/g;
    const hashtags = content.match(hashtagRegex) || [];
    return hashtags.map(tag => tag.substring(1)); // Remove the # symbol
  };

  // Generate RSS items
  const rssItems = projects.map(project => {
    const title = escapeXML(getProjectTitle(project.content));
    const description = escapeXML(getDescription(project));
    const link = `${siteUrl}/post/${project.conversation_id}`;
    const pubDate = new Date(project.date).toUTCString();
    const guid = project.conversation_id;
    const tags = getTags(project.content);
    const author = escapeXML(project.username);
    
    // Build category tags
    const categories = tags.map(tag => `    <category>${escapeXML(tag)}</category>`).join('\n');
    
    // Enhanced description with GitHub info
    let enhancedDescription = description;
    if (project.github_repo) {
      enhancedDescription += `\n\nGitHub Repository: ${project.github_repo}`;
    }
    
    return `  <item>
    <title>${title}</title>
    <description><![CDATA[${enhancedDescription}]]></description>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <pubDate>${pubDate}</pubDate>
    <author>${author}@opensourceprojects.dev (${author})</author>
    <source url="${siteUrl}/rss">Open Source Projects</source>
${categories ? categories + '\n' : ''}${project.github_repo ? `    <enclosure url="${escapeXML(project.github_card_image || '')}" type="image/png" />` : ''}
  </item>`;
  }).join('\n');

  // Generate complete RSS XML
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXML(feedTitle)}</title>
    <description>${escapeXML(feedDescription)}</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss" rel="self" type="application/rss+xml" />
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>hello@opensourceprojects.dev (Open Source Projects)</managingEditor>
    <webMaster>hello@opensourceprojects.dev (Open Source Projects)</webMaster>
    <generator>Open Source Projects RSS Generator</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <cloud domain="opensourceprojects.dev" port="80" path="/rss" registerProcedure="" protocol="soap"/>
    <ttl>300</ttl>
    <image>
      <url>${siteUrl}/images/open-source-logo-830x460.jpg</url>
      <title>${escapeXML(feedTitle)}</title>
      <link>${siteUrl}</link>
      <width>144</width>
      <height>144</height>
      <description>${escapeXML(feedDescription)}</description>
    </image>
${rssItems}
  </channel>
</rss>`;
}

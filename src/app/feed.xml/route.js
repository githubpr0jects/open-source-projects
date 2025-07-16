import { NextResponse } from 'next/server';

// Alternative RSS feed endpoint (feed.xml format)
export async function GET() {
  let projects = null;
  
  try {
    // Fetch data from your existing API
    console.log('Fetching Atom feed data from API...');
    const response = await fetch('https://lb2-twitter-api.opensourceprojects.dev/threads?type=github', {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'User-Agent': 'Open Source Projects Atom Generator/1.0',
        'Accept': 'application/json',
      }
    });

    console.log('Atom API Response status:', response.status);

    if (!response.ok) {
      console.error('Atom API request failed:', response.status, response.statusText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Atom API response keys:', Object.keys(data));
    
    // Handle the response structure - it contains a 'threads' array
    if (data && data.threads && Array.isArray(data.threads)) {
      projects = data.threads;
      console.log('Successfully fetched projects for Atom feed:', projects.length);
    } else {
      console.warn('Unexpected Atom API response structure:', data);
      throw new Error('API response does not contain expected threads array');
    }

    // Generate Atom XML (alternative format)
    const atomXml = generateAtomXML(projects);

    // Return Atom response with proper headers
    return new NextResponse(atomXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Atom feed generation error:', error);
    
    // Return a more informative error Atom feed
    const errorAtom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Open Source Projects - Latest Discoveries</title>
  <link href="https://opensourceprojects.dev"/>
  <link rel="self" href="https://opensourceprojects.dev/feed.xml"/>
  <updated>${new Date().toISOString()}</updated>
  <id>https://opensourceprojects.dev/</id>
  <subtitle>Discover the best open-source projects from GitHub. Curated collection of trending repositories, hidden gems, and amazing developer tools.</subtitle>
  <generator uri="https://opensourceprojects.dev" version="1.0">Open Source Projects</generator>
  <rights>© ${new Date().getFullYear()} Open Source Projects</rights>
  <icon>https://opensourceprojects.dev/images/open-source-projects-favicon.png</icon>
  <logo>https://opensourceprojects.dev/images/open-source-logo-830x460.jpg</logo>
  <entry>
    <title>Feed Temporarily Unavailable</title>
    <link href="https://opensourceprojects.dev"/>
    <id>https://opensourceprojects.dev/feed-unavailable</id>
    <updated>${new Date().toISOString()}</updated>
    <author>
      <name>Open Source Projects</name>
      <email>hello@opensourceprojects.dev</email>
    </author>
    <summary type="text">The Atom feed is temporarily unavailable due to API issues. Please visit opensourceprojects.dev to see the latest open-source projects.</summary>
    <content type="html"><![CDATA[The Atom feed is temporarily unavailable due to API issues (${error.message}). Please visit <a href="https://opensourceprojects.dev">opensourceprojects.dev</a> to see the latest open-source projects.]]></content>
  </entry>
</feed>`;

    return new NextResponse(errorAtom, {
      status: 200, // Use 200 to avoid RSS client errors
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60', // Shorter cache when there's an issue
      },
    });
  }
}

function generateAtomXML(projects) {
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
    const titleWithoutUrls = firstLine.replace(/https?:\/\/[^\s]+/g, '').trim();
    const cleanTitle = titleWithoutUrls || 'Open Source Project';
    return cleanTitle.length > 100 ? cleanTitle.substring(0, 100) + '...' : cleanTitle;
  };

  // Helper function to extract description
  const getDescription = (project) => {
    if (project.markdown_content && project.markdown_content.trim()) {
      const lines = project.markdown_content.split('\n').filter(line => line.trim());
      for (const line of lines) {
        if (line.trim() && !line.startsWith('#') && line.length > 50) {
          return line.trim().length > 300 ? line.trim().substring(0, 300) + '...' : line.trim();
        }
      }
    }
    
    if (project.content) {
      const cleanContent = project.content.replace(/https?:\/\/[^\s]+/g, '').trim();
      return cleanContent.length > 300 ? cleanContent.substring(0, 300) + '...' : cleanContent;
    }
    
    return 'Discover this amazing open-source project on GitHub.';
  };

  // Get the latest update date
  const latestDate = projects.length > 0 ? 
    new Date(Math.max(...projects.map(p => new Date(p.date)))).toISOString() : 
    new Date().toISOString();

  // Generate Atom entries
  const atomEntries = projects.map(project => {
    const title = escapeXML(getProjectTitle(project.content));
    const description = escapeXML(getDescription(project));
    const link = `${siteUrl}/post/${project.conversation_id}`;
    const updated = new Date(project.date).toISOString();
    const id = `${siteUrl}/post/${project.conversation_id}`;
    const author = escapeXML(project.username);
    
    // Enhanced content with GitHub info
    let content = description;
    if (project.github_repo) {
      content += `\n\nGitHub Repository: ${project.github_repo}`;
    }
    
    return `  <entry>
    <title>${title}</title>
    <link href="${link}"/>
    <id>${id}</id>
    <updated>${updated}</updated>
    <author>
      <name>${author}</name>
      <email>${author}@opensourceprojects.dev</email>
    </author>
    <summary type="text">${description}</summary>
    <content type="html"><![CDATA[${content}]]></content>
    ${project.github_repo ? `<link rel="related" href="${escapeXML(project.github_repo)}" title="GitHub Repository"/>` : ''}
  </entry>`;
  }).join('\n');

  // Generate complete Atom XML
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXML(feedTitle)}</title>
  <link href="${siteUrl}"/>
  <link rel="self" href="${siteUrl}/feed.xml"/>
  <updated>${latestDate}</updated>
  <id>${siteUrl}/</id>
  <subtitle>${escapeXML(feedDescription)}</subtitle>
  <generator uri="${siteUrl}" version="1.0">Open Source Projects</generator>
  <rights>© ${new Date().getFullYear()} Open Source Projects</rights>
  <icon>${siteUrl}/images/open-source-projects-favicon.png</icon>
  <logo>${siteUrl}/images/open-source-logo-830x460.jpg</logo>
${atomEntries}
</feed>`;
}

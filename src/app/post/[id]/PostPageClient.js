'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const fallbackImage = '/images/open-source-logo-830x460.jpg';

const getHeroImage = (post) => {
  return post.github_card_image || fallbackImage;
};

const getSourceLabel = (post) => {
  return post.github_repo ? 'GitHub Repo' : 'Opinion';
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

// Function to process markdown content and handle JSON escape characters
const processMarkdownContent = (markdownContent) => {
  if (!markdownContent) return null;
  
  // Process JSON escape characters
  let processedContent = markdownContent
    .replace(/\\n/g, '\n')           // Replace \n with actual newlines
    .replace(/\\"/g, '"')            // Replace \" with actual quotes
    .replace(/\\'/g, "'")            // Replace \' with actual apostrophes
    .replace(/\\t/g, '\t')           // Replace \t with actual tabs
    .replace(/\\r/g, '\r')           // Replace \r with carriage returns
    .replace(/\\\\/g, '\\');         // Replace \\ with single backslash
  
  return processedContent;
};

export default function PostPageClient({ postDetails: initialPostDetails, params }) {
  const [postDetails, setPostDetails] = useState(initialPostDetails || []);
  const [loading, setLoading] = useState(!initialPostDetails);
  const [error, setError] = useState(null);
  const [linkPreviews, setLinkPreviews] = useState({});

  useEffect(() => {
    if (!initialPostDetails) {
      const fetchPostDetails = async () => {
        try {
          const response = await fetch(`https://twitter-api.opensourceprojects.dev/threads/${params.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch post details');
          }
          const data = await response.json();
          setPostDetails(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      if (params.id) {
        fetchPostDetails();
      }
    }
  }, [params.id, initialPostDetails]);

  // Function to fetch link preview via API route
  const fetchLinkPreview = async (url) => {
    if (linkPreviews[url]) {
      return linkPreviews[url];
    }

    try {
      console.log('Fetching preview for:', url);
      const response = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`Preview API failed for ${url}:`, response.status, errorData);
        throw new Error(`Preview API request failed: ${response.status}`);
      }
      
      const preview = await response.json();
      
      // Check if preview has meaningful content
      if (!preview || (!preview.title && !preview.description && !preview.image)) {
        console.log('Preview has no meaningful content for:', url);
        setLinkPreviews(prev => ({
          ...prev,
          [url]: null
        }));
        return null;
      }
      
      console.log('Preview result:', preview);
      
      setLinkPreviews(prev => ({
        ...prev,
        [url]: preview
      }));
      return preview;
    } catch (error) {
      console.warn('Failed to fetch preview for:', url, error.message);
      setLinkPreviews(prev => ({
        ...prev,
        [url]: null
      }));
      return null;
    }
  };

  // Component for rendering link preview card
  const LinkPreviewCard = ({ url, preview, compact = false }) => {
    console.log('Rendering LinkPreviewCard:', { url, preview, compact });
    
    if (!preview || preview.error) {
      console.log('No preview data or error, not rendering card');
      return null;
    }

    // Use the final redirected URL if available, otherwise fall back to original URL
    const finalUrl = preview.finalUrl || preview.url || url;
    console.log('Using final URL for link:', finalUrl, 'Original:', url);

    return (
      <div className={`link-preview-card ${compact ? 'compact' : ''}`}>
        <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="link-preview-link">
          {preview.image && (
            <div className="link-preview-image">
              <Image 
                src={preview.image} 
                alt={preview.title || 'Link preview'} 
                width={400}
                height={200}
                className="link-preview-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                loading="lazy"
                unoptimized
              />
            </div>
          )}
          <div className="link-preview-content">
            {(preview.title || preview.description) && (
              <>
                <h4 className="link-preview-title">
                  {preview.title || 'Link Preview'}
                </h4>
                {preview.description && (
                  <p className="link-preview-description">
                    {preview.description.length > 150 
                      ? preview.description.substring(0, 150) + '...' 
                      : preview.description
                    }
                  </p>
                )}
                <div className="link-preview-url-container">
                  <span className="link-preview-url">
                    <i className="fas fa-external-link-alt"></i>
                    {preview.hostname || new URL(finalUrl).hostname}
                  </span>
                  {preview.wasRedirected && (
                    <span className="link-preview-redirected">
                      <i className="fas fa-arrow-right"></i>
                      <span>Redirected</span>
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </a>
      </div>
    );
  };

  // Enhanced list item component with link preview
  const ListItemWithPreview = ({ text, index }) => {
    const [preview, setPreview] = useState(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    
    // Extract URLs from the text - include t.co for previews
    const urlRegex = /(https?:\/\/[^\s\)\,]+)/g;
    const urls = text.match(urlRegex) || [];
    const mainUrl = urls[0]; // Use the first URL found (including t.co for previews)

    console.log('List item text:', text);
    console.log('Found URLs:', urls);
    console.log('Main URL:', mainUrl);

    useEffect(() => {
      if (mainUrl && !linkPreviews[mainUrl] && linkPreviews[mainUrl] !== null) {
        setIsLoadingPreview(true);
        fetchLinkPreview(mainUrl).then((previewData) => {
          setPreview(previewData);
          setIsLoadingPreview(false);
        });
      } else if (linkPreviews[mainUrl]) {
        setPreview(linkPreviews[mainUrl]);
      }
    }, [mainUrl]);

    return (
      <div className="list-item-with-preview">
        <div className="list-item-text">
          {makeLinksClickable(text)}
        </div>
        {mainUrl && (
          <div className="list-item-preview">
            {isLoadingPreview ? (
              <div className="link-preview-loading">
                <div className="loading-spinner-small"></div>
                <span>Resolving link...</span>
              </div>
            ) : preview ? (
              <LinkPreviewCard url={mainUrl} preview={preview} compact={true} />
            ) : linkPreviews[mainUrl] === null ? (
              <div className="link-preview-failed">
                <i className="fas fa-info-circle"></i>
                <span>Preview not available for this link</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const makeLinksClickable = (text) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    return text.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        // Skip t.co links - don't display them
        if (part.includes('t.co/')) {
          return '';
        }
        
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="content-link"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const formatContent = (content) => {
    // Split content into paragraphs and format them
    const paragraphs = content.split('\n').filter(p => p.trim() !== '');
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a code block
      if (paragraph.includes('```') || paragraph.match(/^[\s]*[{}\[\]()]/)) {
        return (
          <pre key={index} className="code-block">
            <code>{makeLinksClickable(paragraph)}</code>
          </pre>
        );
      }
      
      // Check if it's a heading
      if (paragraph.startsWith('#')) {
        const level = paragraph.match(/^#+/)[0].length;
        const text = paragraph.replace(/^#+\s*/, '');
        const HeadingTag = `h${Math.min(level + 2, 6)}`;
        return <HeadingTag key={index} className="content-heading">{makeLinksClickable(text)}</HeadingTag>;
      }
      
      // Check if it's a list item
      if (paragraph.match(/^[\s]*[-*+]\s/)) {
        const listText = paragraph.replace(/^[\s]*[-*+]\s/, '');
        return (
          <ul key={index} className="content-list">
            <li>
              <ListItemWithPreview text={listText} index={index} />
            </li>
          </ul>
        );
      }
      
      // Regular paragraph - check for URLs and add preview
      const urlRegex = /(https?:\/\/[^\s\)\,]+)/g;
      const hasUrl = urlRegex.test(paragraph);
      
      if (hasUrl) {
        return (
          <div key={index} className="content-paragraph-with-preview">
            <p className="content-paragraph">{makeLinksClickable(paragraph)}</p>
            <ParagraphWithPreview text={paragraph} index={index} />
          </div>
        );
      }
      
      // Regular paragraph without URL
      return <p key={index} className="content-paragraph">{makeLinksClickable(paragraph)}</p>;
    });
  };

  // Component for paragraphs with link preview
  const ParagraphWithPreview = ({ text, index }) => {
    const [preview, setPreview] = useState(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    
    // Extract URLs from the text - include t.co for previews
    const urlRegex = /(https?:\/\/[^\s\)\,]+)/g;
    const urls = text.match(urlRegex) || [];
    const mainUrl = urls[0]; // Use the first URL found (including t.co for previews)

    useEffect(() => {
      if (mainUrl && !linkPreviews[mainUrl] && linkPreviews[mainUrl] !== null) {
        setIsLoadingPreview(true);
        fetchLinkPreview(mainUrl).then((previewData) => {
          setPreview(previewData);
          setIsLoadingPreview(false);
        });
      } else if (linkPreviews[mainUrl]) {
        setPreview(linkPreviews[mainUrl]);
      }
    }, [mainUrl]);

    if (!mainUrl) return null;

    return (
      <div className="paragraph-preview">
        {isLoadingPreview ? (
          <div className="link-preview-loading">
            <div className="loading-spinner-small"></div>
            <span>Loading preview...</span>
          </div>
        ) : preview ? (
          <LinkPreviewCard url={mainUrl} preview={preview} compact={false} />
        ) : linkPreviews[mainUrl] === null ? <></> : null}
      </div>
    );
  };

  const combineAllContent = (posts) => {
    return posts.map((post, index) => ({
      ...post,
      isMain: index === 0
    }));
  };

  // Enhanced formatContent function to handle markdown
  const renderPostContent = (post) => {
    // Check if markdown_content exists and is not null
    if (post.markdown_content && post.markdown_content.trim() !== '') {
      const processedMarkdown = processMarkdownContent(post.markdown_content);
      
      return (
        <div className="markdown-content">
          <ReactMarkdown
            components={{
              // Custom components for better styling
              h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
              h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
              h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
              h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
              h5: ({ children }) => <h5 className="markdown-h5">{children}</h5>,
              h6: ({ children }) => <h6 className="markdown-h6">{children}</h6>,
              p: ({ children }) => <p className="markdown-paragraph">{children}</p>,
              ul: ({ children }) => <ul className="markdown-list">{children}</ul>,
              ol: ({ children }) => <ol className="markdown-ordered-list">{children}</ol>,
              li: ({ children }) => <li className="markdown-list-item">{children}</li>,
              blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
              code: ({ inline, children }) => 
                inline ? 
                  <code className="markdown-inline-code">{children}</code> : 
                  <code className="markdown-code-block">{children}</code>,
              pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
              a: ({ href, children }) => (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="markdown-link"
                >
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <Image 
                  src={src} 
                  alt={alt || 'Image'}
                  width={800}
                  height={400} 
                  className="markdown-image"
                  loading="lazy"
                  unoptimized
                />
              ),
              table: ({ children }) => <table className="markdown-table">{children}</table>,
              thead: ({ children }) => <thead className="markdown-thead">{children}</thead>,
              tbody: ({ children }) => <tbody className="markdown-tbody">{children}</tbody>,
              tr: ({ children }) => <tr className="markdown-tr">{children}</tr>,
              th: ({ children }) => <th className="markdown-th">{children}</th>,
              td: ({ children }) => <td className="markdown-td">{children}</td>,
              hr: () => <hr className="markdown-hr" />,
              strong: ({ children }) => <strong className="markdown-strong">{children}</strong>,
              em: ({ children }) => <em className="markdown-em">{children}</em>,
            }}
          >
            {processedMarkdown}
          </ReactMarkdown>
        </div>
      );
    } else {
      // Fallback to original content formatting if no markdown_content
      return formatContent(post.content);
    }
  };

  if (loading) {
    return (
      <>
        <div className="grain-overlay"></div>
        <Header currentPage="post" />
        <main className="main">
          <div className="container">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <h2>Loading project details...</h2>
              <p>Please wait while we fetch the project information.</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="grain-overlay"></div>
        <Header currentPage="post" />
        <main className="main">
          <div className="container">
            <div className="error-state">
              <div className="error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h1>Project Not Found</h1>
              <p>We couldn&apos;t find the project you&apos;re looking for. It might have been moved or doesn&apos;t exist.</p>
              <p className="error-details">Error: {error} • ID: {params.id}</p>
              <Link href="/" className="btn btn-primary">
                <i className="fas fa-arrow-left"></i>
                <span>Back to Projects</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!postDetails || postDetails.length === 0) {
    return (
      <>
        <div className="grain-overlay"></div>
        <Header currentPage="post" />
        <main className="main">
          <div className="container">
            <div className="error-state">
              <div className="error-icon">
                <i className="fas fa-search"></i>
              </div>
              <h1>Project Not Found</h1>
              <p>The project you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Link href="/" className="btn btn-primary">
                <i className="fas fa-arrow-left"></i>
                <span>Back to Projects</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const mainPost = postDetails[0];
  const allPosts = combineAllContent(postDetails);

  return (
    <>
      <div className="grain-overlay"></div>
      <Header currentPage="post" />

      <main className="main">
        <div className="container">
          {/* Breadcrumb Navigation */}
          <nav className="breadcrumb">
            <Link href="/" className="breadcrumb-link">
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Project Details</span>
          </nav>

          {/* Project Hero Section */}
          <div className="project-hero">
            {/* Hero Image */}
            <div className="hero-image-container">
              <Image 
                src={getHeroImage(mainPost)} 
                alt={getProjectTitle(mainPost.content)}
                width={1200}
                height={630}
                className="hero-image"
                priority
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
                unoptimized
              />
              <div className="hero-overlay"></div>
            </div>

            <div className="project-meta">
              <span className="project-badge">
                <i className={mainPost.github_repo ? "fab fa-github" : "fas fa-comment-alt"}></i>
                {getSourceLabel(mainPost)}
              </span>
              <time className="project-date" dateTime={mainPost.date}>
                <i className="fas fa-calendar"></i>
                {formatDate(mainPost.date)}
              </time>
            </div>
            
            <h1 className="project-title">{getProjectTitle(mainPost.content)}</h1>
            
            {/* Tags */}
            {extractTags(mainPost.content).length > 0 && (
              <div className="project-tags">
                <span className="tags-label">
                  <i className="fas fa-tags"></i>
                  Tags:
                </span>
                <div className="tags-list">
                  {extractTags(mainPost.content).map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="project-author">
              <div className="author-info">
                <div className="author-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="author-details">
                  <span className="author-name">@{mainPost.username}</span>
                  <span className="author-label">
                    {mainPost.github_repo ? 'Post Author' : 'Content Creator'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Content */}
          <div className="project-content">
            <article className="project-article">
              <div className="article-header">
                <div className="article-header-left">
                  <h2>
                    <i className="fas fa-file-alt"></i>
                    Project Description
                  </h2>
                  <div className="article-meta">
                    <span className="meta-item">
                      <i className="fas fa-comments"></i>
                      {postDetails.length} {postDetails.length === 1 ? 'Post' : 'Posts'}
                    </span>
                    <span className="meta-item">
                      <i className="fas fa-hashtag"></i>
                      ID: {params.id}
                    </span>
                  </div>
                </div>
                
                {/* GitHub Repository Link in Article Header */}
                {mainPost.github_repo && (
                  <div className="article-header-right">
                    <a 
                      href={mainPost.github_repo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="github-repo-link"
                    >
                      <i className="fab fa-github"></i>
                      <span>View on GitHub</span>
                      <i className="fas fa-external-link-alt" aria-hidden="true"></i>
                    </a>
                  </div>
                )}
              </div>

              {/* Repository Preview Card */}
              {/* {mainPost.github_repo && (
                <div className="repository-preview-section">
                  <div className="repository-preview-card">
                    <div className="repository-preview-header">
                      <i className="fab fa-github"></i>
                      <span>Repository</span>
                    </div>
                    <div className="repository-preview-content">
                      <div className="repository-url">
                        <a 
                          href={mainPost.github_repo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="repository-link"
                        >
                          {mainPost.github_repo.replace('https://github.com/', '')}
                        </a>
                      </div>
                      <div className="repository-description">
                        Official repository for this project
                      </div>
                    </div>
                  </div>
                </div>
              )} */}

              <div className="article-content">
                {allPosts.map((post, index) => (
                  <div key={post.id} className="content-section">
                    {index > 0 && <div className="section-divider"></div>}
                    <div className="section-content">
                      {renderPostContent(post)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="article-footer">
                <div className="contributors">
                  <h3>
                    <i className="fas fa-users"></i>
                    Contributors
                  </h3>
                  <div className="contributors-list">
                    {[...new Set(postDetails.map(post => post.username))].map((username, index) => (
                      <div key={index} className="contributor">
                        <div className="contributor-avatar">
                          <i className="fas fa-user"></i>
                        </div>
                        <span className="contributor-name">@{username}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="project-stats">
                  <div className="stat-card">
                    <div className="stat-value">{postDetails.length}</div>
                    <div className="stat-label">Total Posts</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{[...new Set(postDetails.map(post => post.username))].length}</div>
                    <div className="stat-label">Contributors</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{formatDate(mainPost.date).split(',')[0]}</div>
                    <div className="stat-label">Created</div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Navigation */}
          <div className="project-navigation">
            <Link href="/" className="btn btn-outline">
              <i className="fas fa-arrow-left"></i>
              <span>Back to Projects</span>
            </Link>
          
            <div className="project-info">
              <span className="info-item">
                <i className="fas fa-layer-group"></i>
                Project ID: {params.id}
              </span>
              <span className="info-item">
                <i className="fas fa-clock"></i>
                Last updated: {formatDate(postDetails[postDetails.length - 1]?.date || mainPost.date)}
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        /* Global styles - Final optimized version */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #0f1419 0%, #1a202c 100%);
          color: #e1e4e8;
          line-height: 1.6;
          overflow-x: hidden;
        }

        /* Optimized grain overlay */
        .grain-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii45IiByZXN1bHQ9Im5vaXNlIiBudW1PY3RhdmVzPSI0Ii8+PGZlQ29sb3JNYXRyaXggaW49Im5vaXNlIiByZXN1bHQ9Im1hcCIgdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjxmZUNvbXBvbmVudFRyYW5zZmVyIGluPSJtYXAiPjxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIC4wNSAwIDAgMCAwIDAgMCAwIC4xIDAgMCAwIDAgMCAwIDAgLjE1IDAgMCAwIDAgMCAwIDAgLjIgMCAwIDAgMCAwIDAgMCAuMjUgMCAwIDAgMCAwIDAgMCAuMyIvPjwvZmVDb21wb25lbnRUcmFuc2Zlcj48L2ZpbHRlcj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIwLjciLz48L3N2Zz4=');
          z-index: 1;
          opacity: 0.025;
        }

        /* Optimized header styles */
        .header {
          background: rgba(13, 17, 23, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #30363d;
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 0.75rem 0;
        }

        .nav {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          display: flex;
          align-items: center;
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: #f0f6fc;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .brand-link:hover {
          color: #58a6ff;
          transform: translateY(-1px);
        }

        .brand-logo {
          height: 32px;
          width: auto;
          max-width: 180px;
          object-fit: contain;
          transition: all 0.3s ease;
        }

        .brand-logo:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }

        .nav-links {
          display: flex;
          gap: 1.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #8b949e;
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .nav-link:hover {
          color: #58a6ff;
          background: rgba(88, 166, 255, 0.1);
          transform: translateY(-1px);
        }

        /* Optimized main content */
        .main {
          min-height: 100vh;
          padding: 1.5rem 0;
          position: relative;
          z-index: 2;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        /* Optimized breadcrumb */
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
        }

        .breadcrumb-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #58a6ff;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .breadcrumb-link:hover {
          color: #79c0ff;
        }

        .breadcrumb-separator {
          color: #8b949e;
          margin: 0 0.25rem;
        }

        .breadcrumb-current {
          color: #e1e4e8;
          font-weight: 500;
        }

        /* Optimized project styles */
        .project-hero {
          background: rgba(13, 17, 23, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid #30363d;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .project-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .project-badge {
          background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
        }

        .project-date {
          color: #8b949e;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .project-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #f0f6fc;
          margin: 0.75rem 0;
          line-height: 1.2;
        }

        .project-author {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.25rem;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .author-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #58a6ff 0%, #0366d6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.1rem;
        }

        .author-details {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .author-name {
          font-weight: 600;
          color: #f0f6fc;
          font-size: 0.95rem;
        }

        .author-label {
          font-size: 0.8rem;
          color: #8b949e;
        }

        .project-content {
          background: rgba(13, 17, 23, 0.6);
          backdrop-filter: blur(15px);
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .project-article {
          max-width: none;
        }

        .article-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #30363d;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .article-header-left {
          flex: 1;
          min-width: 0;
        }

        .article-header-right {
          flex-shrink: 0;
        }

        .article-header h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #f0f6fc;
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .article-meta {
          display: flex;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #8b949e;
          font-size: 0.85rem;
        }

        .article-content {
          line-height: 1.7;
          color: #e1e4e8;
        }

        .content-section {
          margin-bottom: 1.5rem;
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #30363d, transparent);
          margin: 1.5rem 0;
        }

        .content-heading {
          color: #f0f6fc;
          margin: 1.5rem 0 1rem 0;
          font-weight: 600;
        }

        .content-paragraph {
          margin: 1rem 0;
          line-height: 1.7;
        }

        .code-block {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          font-size: 0.9rem;
        }

        .article-footer {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #30363d;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .contributors h3 {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f0f6fc;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .contributors-list {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .contributor {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(48, 54, 61, 0.5);
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #30363d;
        }

        .contributor-avatar {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #58a6ff 0%, #0366d6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.7rem;
        }

        .contributor-name {
          font-size: 0.9rem;
          color: #e1e4e8;
          font-weight: 500;
        }

        .project-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat-card {
          background: rgba(48, 54, 61, 0.5);
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          flex: 1;
          min-width: 80px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #58a6ff;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #8b949e;
          font-weight: 500;
        }

        .project-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(13, 17, 23, 0.6);
          backdrop-filter: blur(15px);
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-outline {
          background: transparent;
          color: #8b949e;
          border: 1px solid #30363d;
        }

        .btn-outline:hover {
          background: rgba(48, 54, 61, 0.5);
          color: #f0f6fc;
          transform: translateY(-1px);
        }

        .btn-primary {
          background: linear-gradient(135deg, #58a6ff 0%, #0366d6 100%);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #0366d6 0%, #0553ba 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(88, 166, 255, 0.3);
        }

        .project-info {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #8b949e;
          font-size: 0.85rem;
        }

        /* Loading and error states */
        .loading-state, .error-state {
          text-align: center;
          padding: 3rem 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #30363d;
          border-top: 3px solid #58a6ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .error-icon {
          font-size: 3rem;
          color: #f85149;
          margin-bottom: 1rem;
        }

        .error-details {
          color: #8b949e;
          font-size: 0.9rem;
          margin: 1rem 0;
        }

        /* Footer */
        .footer {
          background: rgba(13, 17, 23, 0.95);
          border-top: 1px solid #30363d;
          padding: 3rem 0 1rem;
          margin-top: 4rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .footer-section h3, .footer-section h4 {
          color: #f0f6fc;
          margin-bottom: 1rem;
        }

        .footer-section p {
          color: #8b949e;
          line-height: 1.6;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          width: 40px;
          height: 40px;
          background: rgba(48, 54, 61, 0.5);
          border: 1px solid #30363d;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8b949e;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: rgba(88, 166, 255, 0.1);
          color: #58a6ff;
          transform: translateY(-2px);
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 2rem auto 0;
          padding: 1rem 2rem 0;
          border-top: 1px solid #30363d;
          text-align: center;
          color: #8b949e;
          font-size: 0.9rem;
        }

        /* Markdown Content Styles - Dark Mode Only */
        .markdown-content {
          max-width: none;
          color: #e1e4e8;
          line-height: 1.7;
          font-size: 16px;
          margin: 24px 0;
        }

        .markdown-h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #f0f6fc;
          margin: 2rem 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #30363d;
          line-height: 1.2;
        }

        .markdown-h2 {
          font-size: 2rem;
          font-weight: 600;
          color: #f0f6fc;
          margin: 1.5rem 0 1rem 0;
          padding-bottom: 0.3rem;
          border-bottom: 1px solid #30363d;
          line-height: 1.3;
        }

        .markdown-h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #f0f6fc;
          margin: 1.25rem 0 0.75rem 0;
          line-height: 1.4;
        }

        .markdown-h4 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #f0f6fc;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.4;
        }

        .markdown-h5 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #f0f6fc;
          margin: 0.875rem 0 0.5rem 0;
          line-height: 1.4;
        }

        .markdown-h6 {
          font-size: 1rem;
          font-weight: 600;
          color: #8b949e;
          margin: 0.75rem 0 0.5rem 0;
          line-height: 1.4;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .markdown-paragraph {
          margin: 1rem 0;
          line-height: 1.7;
          color: #e1e4e8;
        }

        .markdown-list,
        .markdown-ordered-list {
          margin: 1rem 0;
          padding-left: 2rem;
        }

        .markdown-list {
          list-style-type: disc;
        }

        .markdown-ordered-list {
          list-style-type: decimal;
        }

        .markdown-list-item {
          margin: 0.5rem 0;
          line-height: 1.6;
          color: #e1e4e8;
        }

        .markdown-list-item::marker {
          color: #58a6ff;
          font-weight: bold;
        }

        .markdown-blockquote {
          margin: 1.5rem 0;
          padding: 1rem 1.5rem;
          border-left: 4px solid #58a6ff;
          background: linear-gradient(135deg, #30363d 0%, #21262d 100%);
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #8b949e;
          position: relative;
        }

        .markdown-blockquote::before {
          content: '"';
          font-size: 3rem;
          color: #58a6ff;
          position: absolute;
          left: 1rem;
          top: -0.5rem;
          font-family: Georgia, serif;
          opacity: 0.3;
        }

        .markdown-blockquote p {
          margin: 0;
          padding-left: 2rem;
          color: #8b949e;
        }

        .markdown-inline-code {
          background: #30363d;
          color: #f97583;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 0.9em;
          border: 1px solid #30363d;
        }

        .markdown-pre {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 1.25rem;
          margin: 1.5rem 0;
          overflow-x: auto;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          position: relative;
        }

        .markdown-pre::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #58a6ff, #39d353, #ffab40);
          border-radius: 8px 8px 0 0;
        }

        .markdown-code-block {
          color: #e1e4e8;
          background: transparent;
          padding: 0;
          border: none;
          display: block;
          width: 100%;
        }

        .markdown-link {
          color: #58a6ff;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .markdown-link:hover {
          border-bottom-color: #58a6ff;
          background-color: rgba(88, 166, 255, 0.1);
          padding: 2px 4px;
          margin: -2px -4px;
          border-radius: 4px;
        }

        .markdown-image {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px;
          margin: 1.5rem 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #30363d;
          display: block;
        }

        .markdown-image:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }

        .markdown-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          background: #21262d;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 1px solid #30363d;
        }

        .markdown-thead {
          background: linear-gradient(135deg, #30363d 0%, #21262d 100%);
        }

        .markdown-th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #f0f6fc;
          border-bottom: 2px solid #30363d;
        }

        .markdown-td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #30363d;
          color: #e1e4e8;
        }

        .markdown-tr:nth-child(even) {
          background: #161b22;
        }

        .markdown-tr:hover {
          background: #30363d;
        }

        .markdown-hr {
          border: none;
          height: 2px;
          background: linear-gradient(90deg, transparent, #30363d, transparent);
          margin: 2rem 0;
        }

        .markdown-strong {
          font-weight: 700;
          color: #f0f6fc;
        }

        .markdown-em {
          font-style: italic;
          color: #8b949e;
        }

        /* Optimized hero image */
        .hero-image-container {
          position: relative;
          width: 100%;
          min-height: 200px;
          max-height: 400px;
          margin-bottom: 1.25rem;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .hero-image {
          width: 100% !important;
          height: auto !important;
          max-height: 400px !important;
          object-fit: contain;
          object-position: center;
          transition: transform 0.3s ease;
        }

        .hero-image-container:hover .hero-image {
          transform: scale(1.02);
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.1) 0%,
            rgba(0, 0, 0, 0.05) 50%,
            rgba(0, 0, 0, 0.15) 100%
          );
          pointer-events: none;
        }

        /* Optimized GitHub button */
        .article-github-section {
          margin: 1rem 0 0 0;
          padding-top: 0;
        }

        .github-repo-link {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, #24292f 0%, #1c2128 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid #30363d;
        }

        .github-repo-link:hover {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          color: white;
          border-color: #58a6ff;
        }

        .github-repo-link .github-icon {
          font-size: 1.1rem;
          color: #fff;
          display: inline-block;
          width: 1.1rem;
          text-align: center;
        }

        .github-repo-link i:last-child {
          font-size: 0.8rem;
          opacity: 0.8;
          display: inline-block;
        }

        /* Optimized tags */
        .project-tags {
          margin: 1rem 0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
        }

        .tags-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #8b949e;
          font-size: 0.8rem;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          color: #1565c0;
          padding: 0.35rem 0.75rem;
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 500;
          border: 1px solid #90caf9;
          transition: all 0.2s ease;
        }

        .tag:hover {
          background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(21, 101, 192, 0.2);
        }

        /* Link Preview Cards - Dark Mode */
        .link-preview-card {
          margin: 16px auto;
          border: 1px solid #4a5568;
          border-radius: 12px;
          overflow: hidden;
          background: #2d3748;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 100%;
          display: block;
        }

        .link-preview-card:hover {
          border-color: #58a6ff;
          box-shadow: 0 8px 25px rgba(88, 166, 255, 0.15);
          transform: translateY(-2px);
        }

        .link-preview-link {
          display: block;
          text-decoration: none;
          color: inherit;
          width: 100%;
        }

        .list-item-preview,
        .paragraph-preview {
          display: flex;
          justify-content: center;
          width: 100%;
          margin: 16px 0;
        }

        .link-preview-card:not(.compact) {
          display: flex;
          flex-direction: column;
          max-width: 500px;
          margin: 0;
        }

        .link-preview-card:not(.compact) .link-preview-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          position: relative;
          flex-shrink: 0;
        }

        .link-preview-card:not(.compact) .link-preview-image img,
        .link-preview-card:not(.compact) .link-preview-image .link-preview-img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          object-position: center;
          transition: transform 0.3s ease;
          display: block;
        }

        .link-preview-card:not(.compact) .link-preview-content {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .link-preview-card.compact {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          height: 120px;
          max-width: 600px;
          margin: 0;
        }

        .link-preview-card.compact .link-preview-image {
          width: 120px;
          height: 120px;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          position: relative;
          flex-shrink: 0;
        }

        .link-preview-card.compact .link-preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.3s ease;
          display: block;
        }

        .link-preview-card.compact .link-preview-content {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
          overflow: hidden;
        }

        .link-preview-card:hover .link-preview-image img {
          transform: scale(1.05);
        }

        .link-preview-title {
          font-size: 18px !important;
          font-weight: 600 !important;
          margin: 0 !important;
          color: #f7fafc !important;
          line-height: 1.4 !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 2 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          word-break: break-word !important;
        }

        .link-preview-description {
          font-size: 15px !important;
          color: #cbd5e0 !important;
          margin: 0 !important;
          line-height: 1.5 !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 3 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          word-break: break-word !important;
          flex: 1 !important;
        }

        .link-preview-card.compact .link-preview-title {
          font-size: 15px !important;
          font-weight: 600 !important;
          margin: 0 0 8px 0 !important;
          -webkit-line-clamp: 2 !important;
          line-height: 1.3 !important;
        }

        .link-preview-card.compact .link-preview-description {
          font-size: 13px !important;
          margin: 0 0 12px 0 !important;
          -webkit-line-clamp: 2 !important;
          color: #cbd5e0 !important;
          line-height: 1.4 !important;
        }

        .link-preview-url-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: auto;
          flex-shrink: 0;
        }

        .link-preview-url {
          font-size: 13px !important;
          color: #58a6ff !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          font-weight: 500 !important;
          text-transform: lowercase !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          flex: 1 !important;
        }

        .link-preview-card.compact .link-preview-url {
          font-size: 12px !important;
        }

        .link-preview-url i {
          font-size: 11px !important;
          flex-shrink: 0 !important;
        }

        .link-preview-redirected {
          font-size: 11px !important;
          color: #28a745 !important;
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
          font-weight: 500 !important;
          background: rgba(40, 167, 69, 0.1) !important;
          padding: 3px 8px !important;
          border-radius: 4px !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
        }

        .link-preview-redirected i {
          font-size: 9px !important;
        }

        .link-preview-loading {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
          border: 1px solid #4a5568;
          border-radius: 8px;
          font-size: 14px;
          color: #cbd5e0;
          margin: 0 auto;
          max-width: 400px;
        }

        .link-preview-failed {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #744210 0%, #975a16 100%);
          border: 1px solid #975a16;
          border-radius: 6px;
          font-size: 13px;
          color: #fbd38d;
          margin: 0 auto;
          max-width: 400px;
        }

        .loading-spinner-small {
          width: 18px;
          height: 18px;
          border: 2px solid #4a5568;
          border-top: 2px solid #58a6ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .list-item-with-preview {
          margin-bottom: 24px;
        }

        .list-item-text {
          margin-bottom: 12px;
          line-height: 1.6;
          font-size: 16px;
          text-align: center;
        }

        .list-item-preview {
          margin-left: 0;
        }

        .content-paragraph-with-preview {
          margin-bottom: 24px;
        }

        .content-paragraph-with-preview .content-paragraph {
          margin-bottom: 12px;
          text-align: center;
        }

        .content-list {
          list-style: none;
          padding-left: 0;
          margin: 20px 0;
        }

        .content-list li {
          position: relative;
          padding-left: 28px;
          margin-bottom: 20px;
        }

        .content-list li:before {
          content: "•";
          position: absolute;
          left: 10px;
          top: 4px;
          color: #58a6ff;
          font-weight: bold;
          font-size: 18px;
        }

        .content-link {
          color: #58a6ff;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .content-link:hover {
          border-bottom-color: #58a6ff;
          background-color: rgba(88, 166, 255, 0.1);
          padding: 3px 6px;
          margin: -3px -6px;
          border-radius: 4px;
        }

        /* Optimized footer */
        .footer {
          background: rgba(13, 17, 23, 0.95);
          border-top: 1px solid #30363d;
          padding: 2rem 0 1rem;
          margin-top: 2rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .footer-section h3, .footer-section h4 {
          color: #f0f6fc;
          margin-bottom: 0.75rem;
          font-size: 1.1rem;
        }

        .footer-section p {
          color: #8b949e;
          line-height: 1.6;
          font-size: 0.9rem;
        }

        .social-links {
          display: flex;
          gap: 0.75rem;
        }

        .social-link {
          width: 36px;
          height: 36px;
          background: rgba(48, 54, 61, 0.5);
          border: 1px solid #30363d;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8b949e;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: rgba(88, 166, 255, 0.1);
          color: #58a6ff;
          transform: translateY(-2px);
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 1.5rem auto 0;
          padding: 1rem 1.5rem 0;
          border-top: 1px solid #30363d;
          text-align: center;
          color: #8b949e;
          font-size: 0.85rem;
        }

        /* Final optimized responsive design */
        @media screen and (max-width: 768px) {
          .nav {
            padding: 0 1rem;
          }

          .nav-links {
            gap: 0.75rem;
          }

          .nav-link {
            padding: 0.4rem 0.6rem;
            font-size: 0.8rem;
          }

          .container {
            padding: 0 1rem;
          }

          .main {
            padding: 1rem 0;
          }

          .project-hero {
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1rem;
          }

          .project-title {
            font-size: 1.75rem;
            margin: 0.5rem 0;
          }

          .project-content {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
          }

          .article-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
          }

          .article-header-left {
            width: 100%;
          }

          .article-header-right {
            width: 100%;
            align-self: flex-start;
          }

          .article-header h2 {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
          }

          .hero-image-container {
            min-height: 150px;
            max-height: 250px;
            margin-bottom: 1rem;
            border-radius: 8px;
          }

          .github-repo-link {
            padding: 0.6rem 1rem;
            font-size: 0.85rem;
            gap: 0.5rem;
          }

          .project-tags {
            margin: 0.75rem 0;
            gap: 0.5rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 0 1rem;
          }

          .footer {
            padding: 1.5rem 0 1rem;
            margin-top: 1.5rem;
          }
        }

        @media screen and (max-width: 480px) {
          .container {
            padding: 0 0.75rem;
          }

          .main {
            padding: 0.75rem 0;
          }

          .project-hero {
            padding: 0.75rem;
            margin-bottom: 0.75rem;
          }

          .project-title {
            font-size: 1.5rem;
            margin: 0.5rem 0;
          }

          .project-content {
            padding: 0.75rem;
            margin-bottom: 0.75rem;
          }

          .article-header h2 {
            font-size: 1.1rem;
          }

          .hero-image-container {
            min-height: 120px;
            max-height: 200px;
            margin-bottom: 0.75rem;
            border-radius: 6px;
          }

          .github-repo-link {
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }

          .project-tags {
            margin: 0.5rem 0;
            gap: 0.4rem;
          }

          .tag {
            padding: 0.25rem 0.5rem;
            font-size: 0.7rem;
          }

          .footer {
            padding: 1rem 0;
            margin-top: 1rem;
          }

          .footer-content {
            padding: 0 0.75rem;
          }
        }
        
        /* Markdown Content Styles - Dark Mode Only */
        .markdown-content {
          max-width: none;
          color: #e1e4e8;
          line-height: 1.7;
          font-size: 16px;
          margin: 24px 0;
        }

        .markdown-h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #f0f6fc;
          margin: 2rem 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #30363d;
          line-height: 1.2;
        }

        .markdown-h2 {
          font-size: 2rem;
          font-weight: 600;
          color: #f0f6fc;
          margin: 1.5rem 0 1rem 0;
          padding-bottom: 0.3rem;
          border-bottom: 1px solid #30363d;
          line-height: 1.3;
        }

        .markdown-h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #f0f6fc;
          margin: 1.25rem 0 0.75rem 0;
          line-height: 1.4;
        }

        .markdown-h4 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #f0f6fc;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.4;
        }

        .markdown-h5 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #f0f6fc;
          margin: 0.875rem 0 0.5rem 0;
          line-height: 1.4;
        }

        .markdown-h6 {
          font-size: 1rem;
          font-weight: 600;
          color: #8b949e;
          margin: 0.75rem 0 0.5rem 0;
          line-height: 1.4;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .markdown-paragraph {
          margin: 1rem 0;
          line-height: 1.7;
          color: #e1e4e8;
        }

        .markdown-list,
        .markdown-ordered-list {
          margin: 1rem 0;
          padding-left: 2rem;
        }

        .markdown-list {
          list-style-type: disc;
        }

        .markdown-ordered-list {
          list-style-type: decimal;
        }

        .markdown-list-item {
          margin: 0.5rem 0;
          line-height: 1.6;
          color: #e1e4e8;
        }

        .markdown-list-item::marker {
          color: #58a6ff;
          font-weight: bold;
        }

        .markdown-blockquote {
          margin: 1.5rem 0;
          padding: 1rem 1.5rem;
          border-left: 4px solid #58a6ff;
          background: linear-gradient(135deg, #30363d 0%, #21262d 100%);
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #8b949e;
          position: relative;
        }

        .markdown-blockquote::before {
          content: '"';
          font-size: 3rem;
          color: #58a6ff;
          position: absolute;
          left: 1rem;
          top: -0.5rem;
          font-family: Georgia, serif;
          opacity: 0.3;
        }

        .markdown-blockquote p {
          margin: 0;
          padding-left: 2rem;
          color: #8b949e;
        }

        .markdown-inline-code {
          background: #30363d;
          color: #f97583;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 0.9em;
          border: 1px solid #30363d;
        }

        .markdown-pre {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 1.25rem;
          margin: 1.5rem 0;
          overflow-x: auto;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          position: relative;
        }

        .markdown-pre::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #58a6ff, #39d353, #ffab40);
          border-radius: 8px 8px 0 0;
        }

        .markdown-code-block {
          color: #e1e4e8;
          background: transparent;
          padding: 0;
          border: none;
          display: block;
          width: 100%;
        }

        .markdown-link {
          color: #58a6ff;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .markdown-link:hover {
          border-bottom-color: #58a6ff;
          background-color: rgba(88, 166, 255, 0.1);
          padding: 2px 4px;
          margin: -2px -4px;
          border-radius: 4px;
        }

        .markdown-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #30363d;
        }

        .markdown-image:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }

        .markdown-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          background: #21262d;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 1px solid #30363d;
        }

        .markdown-thead {
          background: linear-gradient(135deg, #30363d 0%, #21262d 100%);
        }

        .markdown-th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #f0f6fc;
          border-bottom: 2px solid #30363d;
        }

        .markdown-td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #30363d;
          color: #e1e4e8;
        }

        .markdown-tr:nth-child(even) {
          background: #161b22;
        }

        .markdown-tr:hover {
          background: #30363d;
        }

        .markdown-hr {
          border: none;
          height: 2px;
          background: linear-gradient(90deg, transparent, #30363d, transparent);
          margin: 2rem 0;
        }

        .markdown-strong {
          font-weight: 700;
          color: #f0f6fc;
        }

        .markdown-em {
          font-style: italic;
          color: #8b949e;
        }

        /* Article GitHub Section Styles */
        .article-github-section {
          margin: 16px 0 0 0;
          padding-top: 0;
        }

        .github-repo-link {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #24292f 0%, #1c2128 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid #30363d;
        }

        .github-repo-link:hover {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          color: white;
          border-color: #58a6ff;
        }

        .github-repo-link .github-icon {
          font-size: 20px;
          color: #fff;
          display: inline-block;
          width: 20px;
          text-align: center;
          font-weight: bold;
        }

        .github-repo-link i:last-child {
          font-size: 14px;
          opacity: 0.8;
          display: inline-block;
        }

        /* Repository Preview Card Styles */
        .repository-preview-section {
          margin: 24px 0;
        }

        .repository-preview-card {
          background: linear-gradient(135deg, #21262d 0%, #161b22 100%);
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .repository-preview-card:hover {
          border-color: #58a6ff;
          box-shadow: 0 8px 25px rgba(88, 166, 255, 0.1);
          transform: translateY(-2px);
        }

        .repository-preview-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: #58a6ff;
          font-weight: 600;
          font-size: 16px;
        }

        .repository-preview-header i {
          font-size: 20px;
        }

        .repository-preview-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .repository-url {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 15px;
        }

        .repository-link {
          color: #58a6ff;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          border-bottom: 1px solid transparent;
        }

        .repository-link:hover {
          border-bottom-color: #58a6ff;
          background-color: rgba(88, 166, 255, 0.1);
          padding: 4px 8px;
          margin: -4px -8px;
          border-radius: 4px;
        }

        .repository-description {
          color: #8b949e;
          font-size: 14px;
          font-style: italic;
        }

        /* Responsive Markdown Styles with 30% reduction on mobile */
        @media screen and (max-width: 768px) {
          .markdown-content {
            font-size: 15px;
          }

          /* 30% reduction from original sizes */
          .markdown-h1 {
            font-size: 1.75rem; /* was 2.5rem -> 70% = 1.75rem */
          }

          .markdown-h2 {
            font-size: 1.4rem; /* was 2rem -> 70% = 1.4rem */
          }

          .markdown-h3 {
            font-size: 1.05rem; /* was 1.5rem -> 70% = 1.05rem */
          }

          .markdown-h4 {
            font-size: 0.875rem; /* was 1.25rem -> 70% = 0.875rem */
          }

          .github-repo-link {
            padding: 10px 16px;
            font-size: 15px;
          }

          .repository-preview-card {
            padding: 16px;
          }

          .repository-preview-header {
            font-size: 15px;
            margin-bottom: 12px;
          }

          .repository-preview-header i {
            font-size: 18px;
          }
        }

        @media screen and (max-width: 480px) {
          .markdown-content {
            font-size: 14px;
          }

          /* Further reduction for smaller screens */
          .markdown-h1 {
            font-size: 1.5rem; /* Additional reduction for mobile */
          }

          .markdown-h2 {
            font-size: 1.25rem;
          }

          .markdown-h3 {
            font-size: 1rem;
          }

          .markdown-h4 {
            font-size: 0.875rem;
          }

          .github-repo-link {
            padding: 8px 14px;
            font-size: 14px;
            gap: 8px;
          }

          .github-repo-link i:first-child {
            font-size: 18px;
          }

          .repository-preview-card {
            padding: 14px;
          }

          .repository-preview-header {
            font-size: 14px;
            margin-bottom: 10px;
          }

          .repository-preview-header i {
            font-size: 16px;
          }

          .repository-url {
            font-size: 13px;
          }

          .repository-description {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}

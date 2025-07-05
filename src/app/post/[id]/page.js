'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TwitterMetrics from '../../components/TwitterMetrics';

const fallbackImage = '/images/open-source-logo-830x460.jpg';

const getHeroImage = (post) => {
  return post.github_card_image || fallbackImage;
};

const getSourceLabel = (post) => {
  return post.github_repo ? 'GitHub Repo' : 'Opinion';
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

const getTwitterUrl = (postId, username = 'GithubProjects') => {
  // Construct Twitter URL from post ID
  // Since the post data comes from @githubprojects tweets, we can construct the URL
  return `https://x.com/${username}/status/${postId}`;
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

  const combineAllContent = (posts) => {
    return posts.map((post, index) => ({
      ...post,
      isMain: index === 0
    }));
  };

export default function PostPage() {
  const params = useParams();
  const [postDetails, setPostDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkPreviews, setLinkPreviews] = useState({});

  useEffect(() => {
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
  }, [params.id]);

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

    return (
      <div className={`link-preview-card ${compact ? 'compact' : ''}`}>
        <a href={url} target="_blank" rel="noopener noreferrer" className="link-preview-link">
          {preview.image && (
            <div className="link-preview-image">
              <img 
                src={preview.image} 
                alt={preview.title || 'Link preview'} 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                loading="lazy"
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
                    {preview.hostname || new URL(preview.finalUrl || url).hostname}
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
    
    // Extract URLs from the text
    const urlRegex = /(https?:\/\/[^\s\)\,]+)/g;
    const urls = text.match(urlRegex) || [];
    const mainUrl = urls[0]; // Use the first URL found

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
    
    // Extract URLs from the text
    const urlRegex = /(https?:\/\/[^\s\)\,]+)/g;
    const urls = text.match(urlRegex) || [];
    const mainUrl = urls[0]; // Use the first URL found

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

  const getProjectTitle = (content) => {
    const firstLine = content.split('\n')[0];
    if (firstLine.length > 80) {
      return firstLine.substring(0, 80) + '...';
    }
    return firstLine || 'Open Source Project';
  };

  const combineAllContent = (posts) => {
    return posts.map((post, index) => ({
      ...post,
      isMain: index === 0
    }));
  };

  if (loading) {
    return (
      <>
        <div className="grain-overlay"></div>
        <header className="header">
          <nav className="nav">
            <div className="nav-brand">
              <Link href="/" className="brand-link">
                <i className="fab fa-github brand-icon"></i>
                <span className="brand-text">Open-source Projects</span>
              </Link>
            </div>
            <div className="nav-links">
              <Link href="/" className="nav-link">
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
              <Link href="#" className="nav-link">
                <i className="fas fa-star"></i>
                <span>Featured</span>
              </Link>
              <Link href="#" className="nav-link">
                <i className="fas fa-gem"></i>
                <span>Hidden Gems</span>
              </Link>
            </div>
          </nav>
        </header>
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
        <header className="header">
          <nav className="nav">
            <div className="nav-brand">
              <Link href="/" className="brand-link">
                <i className="fab fa-github brand-icon"></i>
                <span className="brand-text">Open-source Projects</span>
              </Link>
            </div>
            <div className="nav-links">
              <Link href="/" className="nav-link">
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
              <Link href="#" className="nav-link">
                <i className="fas fa-star"></i>
                <span>Featured</span>
              </Link>
              <Link href="#" className="nav-link">
                <i className="fas fa-gem"></i>
                <span>Hidden Gems</span>
              </Link>
            </div>
          </nav>
        </header>
        <main className="main">
          <div className="container">
            <div className="error-state">
              <div className="error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h1>Project Not Found</h1>
              <p>We couldn't find the project you're looking for. It might have been moved or doesn't exist.</p>
              <p className="error-details">Error: {error} • ID: {params.id}</p>
              <Link href="/" className="btn btn-primary">
                <i className="fas fa-arrow-left"></i>
                <span>Back to Projects</span>
              </Link>
            </div>
          </div>
        </main>
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Open-source Projects</h3>
              <p>Discovering and showcasing the best open-source projects and hidden gems in the developer community.</p>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <div className="social-links">
                <a href="#" className="social-link">
                  <i className="fab fa-github"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-discord"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Open-source Projects. Built with <i className="fas fa-heart"></i> for the community.</p>
          </div>
        </footer>
      </>
    );
  }

  if (!postDetails || postDetails.length === 0) {
    return (
      <>
        <div className="grain-overlay"></div>
        <header className="header">
          <nav className="nav">
            <div className="nav-brand">
              <Link href="/" className="brand-link">
                <i className="fab fa-github brand-icon"></i>
                <span className="brand-text">Open-source Projects</span>
              </Link>
            </div>
            <div className="nav-links">
              <Link href="/" className="nav-link">
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
              <Link href="#" className="nav-link">
                <i className="fas fa-star"></i>
                <span>Featured</span>
              </Link>
              <Link href="#" className="nav-link">
                <i className="fas fa-gem"></i>
                <span>Hidden Gems</span>
              </Link>
            </div>
          </nav>
        </header>
        <main className="main">
          <div className="container">
            <div className="error-state">
              <div className="error-icon">
                <i className="fas fa-search"></i>
              </div>
              <h1>Project Not Found</h1>
              <p>The project you're looking for doesn't exist or has been removed.</p>
              <Link href="/" className="btn btn-primary">
                <i className="fas fa-arrow-left"></i>
                <span>Back to Projects</span>
              </Link>
            </div>
          </div>
        </main>
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Open-source Projects</h3>
              <p>Discovering and showcasing the best open-source projects and hidden gems in the developer community.</p>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <div className="social-links">
                <a href="#" className="social-link">
                  <i className="fab fa-github"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-discord"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Open-source Projects. Built with <i className="fas fa-heart"></i> for the community.</p>
          </div>
        </footer>
      </>
    );
  }

  const mainPost = postDetails[0];
  const allPosts = combineAllContent(postDetails);

  return (
    <>
      <div className="grain-overlay"></div>
      
      <header className="header">
        <nav className="nav">
          <div className="nav-brand">
            <Link href="/" className="brand-link">
              <i className="fab fa-github brand-icon"></i>
              <span className="brand-text">Open-source Projects</span>
            </Link>
          </div>
          <div className="nav-links">
            <Link href="/" className="nav-link">
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>
            <Link href="#" className="nav-link">
              <i className="fas fa-star"></i>
              <span>Featured</span>
            </Link>
            <Link href="#" className="nav-link">
              <i className="fas fa-gem"></i>
              <span>Hidden Gems</span>
            </Link>
          </div>
        </nav>
      </header>

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
              <img 
                src={getHeroImage(mainPost)} 
                alt={getProjectTitle(mainPost.content)}
                className="hero-image"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
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
            
            {/* GitHub Repository Link */}
            {mainPost.github_repo && (
              <div className="github-repo-section">
                <a 
                  href={mainPost.github_repo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="github-repo-link"
                >
                  <i className="fab fa-github"></i>
                  <span>View on GitHub</span>
                  <i className="fas fa-external-link-alt"></i>
                </a>
              </div>
            )}

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
                    {mainPost.github_repo ? 'Repository Maintainer' : 'Content Creator'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Content */}
          <div className="project-content">
            <article className="project-article">
              <div className="article-header">
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

              <div className="article-content">
                {allPosts.map((post, index) => (
                  <div key={post.id} className="content-section">
                    {index > 0 && <div className="section-divider"></div>}
                    <div className="section-content">
                      {formatContent(post.content)}
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

                {/* Twitter Engagement Metrics */}
                <TwitterMetrics 
                  postId={params.id}
                  tweetUrl={getTwitterUrl(params.id, mainPost.username)}
                />
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

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Open-source Projects</h3>
            <p>Discovering and showcasing the best open-source projects and hidden gems in the developer community.</p>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#" className="social-link">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" className="social-link">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link">
                <i className="fab fa-discord"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Open-source Projects. Built with <i className="fas fa-heart"></i> for the community.</p>
        </div>
      </footer>

      <style jsx global>{`
        /* Hero Image Styles */
        .hero-image-container {
          position: relative;
          width: 100%;
          height: 300px;
          margin-bottom: 24px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
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

        /* GitHub Repository Link Styles */
        .github-repo-section {
          margin: 20px 0;
        }

        .github-repo-link {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #333 0%, #1a1a1a 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .github-repo-link:hover {
          background: linear-gradient(135deg, #24292e 0%, #0d1117 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          color: white;
        }

        .github-repo-link i:first-child {
          font-size: 20px;
        }

        .github-repo-link i:last-child {
          font-size: 14px;
        }

        /* Project Tags Styles */
        .project-tags {
          margin: 20px 0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
        }

        .tags-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #666;
          font-size: 14px;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          color: #1565c0;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid #90caf9;
          transition: all 0.2s ease;
        }

        .tag:hover {
          background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(21, 101, 192, 0.2);
        }

        /* Update project badge styles */
        .project-badge {
          background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
        }

        .project-badge i {
          font-size: 16px;
        }

        /* Opinion badge variant */
        .project-hero .project-meta .project-badge:has(.fa-comment-alt) {
          background: linear-gradient(135deg, #ff6b35 0%, #e55100 100%);
          box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
        }

        /* Responsive adjustments for hero image */
        @media screen and (max-width: 768px) {
          .hero-image-container {
            height: 240px;
            margin-bottom: 20px;
            border-radius: 12px;
          }

          .github-repo-link {
            padding: 10px 16px;
            font-size: 15px;
          }

          .project-tags {
            margin: 16px 0;
            gap: 8px;
          }

          .tags-label {
            font-size: 13px;
          }

          .tag {
            padding: 4px 10px;
            font-size: 12px;
          }
        }

        @media screen and (max-width: 480px) {
          .hero-image-container {
            height: 200px;
            margin-bottom: 16px;
            border-radius: 8px;
          }

          .github-repo-link {
            padding: 8px 14px;
            font-size: 14px;
            gap: 8px;
          }

          .github-repo-link i:first-child {
            font-size: 18px;
          }

          .project-tags {
            flex-direction: column;
            align-items: flex-start;
            margin: 12px 0;
          }

          .tags-list {
            width: 100%;
            gap: 6px;
          }
        }

        .link-preview-card {
          margin: 16px auto; /* Changed from '16px 0' to '16px auto' for centering */
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          width: 100%;
          max-width: 100%;
          display: block;
        }

        .link-preview-card:hover {
          border-color: #0066cc;
          box-shadow: 0 8px 25px rgba(0, 102, 204, 0.15);
          transform: translateY(-2px);
        }

        .link-preview-link {
          display: block;
          text-decoration: none;
          color: inherit;
          width: 100%;
        }

        /* Container for centering preview cards */
        .list-item-preview,
        .paragraph-preview {
          display: flex;
          justify-content: center;
          width: 100%;
          margin: 16px 0;
        }

        /* Regular card layout (stacked) - Desktop */
        .link-preview-card:not(.compact) {
          display: flex;
          flex-direction: column;
          max-width: 500px;
          margin: 0; /* Remove margin since parent container handles centering */
        }

        .link-preview-card:not(.compact) .link-preview-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          position: relative;
          flex-shrink: 0;
        }

        .link-preview-card:not(.compact) .link-preview-image img {
          width: 100%;
          height: 100%;
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

        /* Compact card layout - Desktop horizontal */
        .link-preview-card.compact {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          height: 120px;
          max-width: 600px;
          margin: 0; /* Remove margin since parent container handles centering */
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

        /* Hover effects */
        .link-preview-card:hover .link-preview-image img {
          transform: scale(1.05);
        }

        /* Content styling - Desktop */
        .link-preview-title {
          font-size: 18px !important;
          font-weight: 600 !important;
          margin: 0 !important;
          color: #1a1a1a !important;
          line-height: 1.4 !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 2 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          word-break: break-word !important;
        }

        .link-preview-description {
          font-size: 15px !important;
          color: #666 !important;
          margin: 0 !important;
          line-height: 1.5 !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 3 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          word-break: break-word !important;
          flex: 1 !important;
        }

        /* Compact card text sizing */
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
          color: #666 !important;
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
          color: #0066cc !important;
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

        /* Loading and error states - also centered */
        .link-preview-loading {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #dee2e6;
          border-radius: 8px;
          font-size: 14px;
          color: #6c757d;
          margin: 0 auto; /* Center the loading state */
          max-width: 400px;
        }

        .link-preview-failed {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          font-size: 13px;
          color: #856404;
          margin: 0 auto; /* Center the error state */
          max-width: 400px;
        }

        .loading-spinner-small {
          width: 18px;
          height: 18px;
          border: 2px solid #e1e5e9;
          border-top: 2px solid #0066cc;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* List styling */
        .list-item-with-preview {
          margin-bottom: 24px;
        }

        .list-item-text {
          margin-bottom: 12px;
          line-height: 1.6;
          font-size: 16px;
          text-align: center; /* Center the text above preview */
        }

        .list-item-preview {
          margin-left: 0;
        }

        .content-paragraph-with-preview {
          margin-bottom: 24px;
        }

        .content-paragraph-with-preview .content-paragraph {
          margin-bottom: 12px;
          text-align: center; /* Center the text above preview */
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
          color: #0066cc;
          font-weight: bold;
          font-size: 18px;
        }

        .content-link {
          color: #0066cc;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .content-link:hover {
          border-bottom-color: #0066cc;
          background-color: rgba(0, 102, 204, 0.08);
          padding: 3px 6px;
          margin: -3px -6px;
          border-radius: 4px;
        }

        /* Large Desktop - 1200px and above */
        @media screen and (min-width: 1200px) {
          .link-preview-card:not(.compact) {
            max-width: 600px;
          }

          .link-preview-card.compact {
            max-width: 700px;
            height: 140px;
          }

          .link-preview-card.compact .link-preview-image {
            width: 140px;
            height: 140px;
          }

          .link-preview-card.compact .link-preview-content {
            padding: 20px;
          }

          .link-preview-card.compact .link-preview-title {
            font-size: 16px !important;
          }

          .link-preview-card.compact .link-preview-description {
            font-size: 14px !important;
          }
        }

        /* Tablet Responsive - 768px and below */
        @media screen and (max-width: 768px) {
          .link-preview-card:not(.compact) {
            max-width: 100%;
          }

          .link-preview-card:not(.compact) .link-preview-image {
            height: 160px;
          }

          .link-preview-card:not(.compact) .link-preview-content {
            padding: 16px;
          }

          .link-preview-card.compact {
            height: 100px;
            max-width: 100%;
          }

          .link-preview-card.compact .link-preview-image {
            width: 100px;
            height: 100px;
          }

          .link-preview-card.compact .link-preview-content {
            padding: 12px 14px;
          }

          .link-preview-title {
            font-size: 16px !important;
          }

          .link-preview-description {
            font-size: 14px !important;
          }

          .link-preview-card.compact .link-preview-title {
            font-size: 14px !important;
          }

          .link-preview-card.compact .link-preview-description {
            font-size: 12px !important;
          }

          /* Keep text left-aligned on mobile for better readability */
          .list-item-text,
          .content-paragraph-with-preview .content-paragraph {
            text-align: left;
          }
        }

        /* Mobile Responsive - 480px and below */
        @media screen and (max-width: 480px) {
          .link-preview-card:not(.compact) .link-preview-image {
            height: 140px;
          }

          .link-preview-card:not(.compact) .link-preview-content {
            padding: 14px;
          }

          /* Make compact cards stack vertically on mobile */
          .link-preview-card.compact {
            flex-direction: column;
            height: auto;
          }

          .link-preview-card.compact .link-preview-image {
            width: 100%;
            height: 120px;
          }

          .link-preview-card.compact .link-preview-content {
            padding: 14px;
          }

          .link-preview-title {
            font-size: 15px !important;
          }

          .link-preview-description {
            font-size: 13px !important;
            -webkit-line-clamp: 2 !important;
          }

          .link-preview-card.compact .link-preview-title {
            font-size: 15px !important;
            margin-bottom: 8px !important;
          }

          .link-preview-card.compact .link-preview-description {
            font-size: 13px !important;
            margin-bottom: 10px !important;
          }

          .list-item-text {
            font-size: 15px;
          }

          .content-list li {
            padding-left: 24px;
            margin-bottom: 16px;
          }

          .list-item-with-preview {
            margin-bottom: 18px;
          }
        }

        /* Extra small mobile - 360px and below */
        @media screen and (max-width: 360px) {
          .link-preview-card:not(.compact) .link-preview-image {
            height: 120px;
          }

          .link-preview-card:not(.compact) .link-preview-content {
            padding: 12px;
          }

          .link-preview-card.compact .link-preview-image {
            height: 100px;
          }

          .link-preview-card.compact .link-preview-content {
            padding: 12px;
          }

          .link-preview-title {
            font-size: 14px !important;
            -webkit-line-clamp: 2 !important;
          }

          .link-preview-description {
            font-size: 12px !important;
            -webkit-line-clamp: 2 !important;
          }

          .link-preview-url {
            font-size: 11px !important;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .link-preview-card {
            background: #2d3748 !important;
            border-color: #4a5568 !important;
          }

          .link-preview-title {
            color: #f7fafc !important;
          }

          .link-preview-description {
            color: #cbd5e0 !important;
          }

          .link-preview-loading {
            background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%) !important;
            border-color: #4a5568 !important;
            color: #cbd5e0 !important;
          }

          .link-preview-failed {
            background: linear-gradient(135deg, #744210 0%, #975a16 100%) !important;
            border-color: #975a16 !important;
            color: #fbd38d !important;
          }
        }
      `}</style>
    </>
  );
}
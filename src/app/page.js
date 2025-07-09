'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import BookmarkButton from './components/BookmarkButton';

function HomePageContent() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const url = currentPage === 1 
          ? 'https://twitter-api.opensourceprojects.dev/threads?type=github'
          : `https://twitter-api.opensourceprojects.dev/threads?type=github&page=${currentPage}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data.threads);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page === 1) {
      router.push('/');
    } else {
      router.push(`/?page=${page}`);
    }
  };

  // Function to get fallback image
  const getFallbackImage = () => {
    return '/images/open-source-logo-830x460.jpg';
  };

  // Function to get clean project title without URLs
  const getProjectTitle = (content) => {
    // Handle both escaped and unescaped newlines
    const firstLine = content.split(/\\n|\n/)[0];
    // Remove URLs from the title
    const titleWithoutUrls = firstLine.replace(/https?:\/\/[^\s]+/g, '').trim();
    const cleanTitle = titleWithoutUrls || 'Open Source Project';
    return cleanTitle.length > 80 ? cleanTitle.substring(0, 80) + '...' : cleanTitle;
  };

  // Function to extract repository name from GitHub URL
  const getRepoName = (githubUrl) => {
    if (!githubUrl) return null;
    const match = githubUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : null;
  };

  // Function to get project category/tags
  const getProjectTags = (post) => {
    const tags = [];
    
    if (post.github_repo) {
      tags.push({
        label: 'GitHub',
        icon: 'fab fa-github',
        color: '#333',
        bgColor: '#f6f8fa'
      });
    }
    
    // Add more tags based on content analysis
    const content = post.content.toLowerCase();
    
    if (content.includes('api') || content.includes('swagger')) {
      tags.push({
        label: 'API',
        icon: 'fas fa-code',
        color: '#0066cc',
        bgColor: '#e6f3ff'
      });
    }
    
    if (content.includes('ui') || content.includes('interface')) {
      tags.push({
        label: 'UI',
        icon: 'fas fa-palette',
        color: '#28a745',
        bgColor: '#e6f7e6'
      });
    }
    
    if (content.includes('terminal') || content.includes('cli')) {
      tags.push({
        label: 'CLI',
        icon: 'fas fa-terminal',
        color: '#6f42c1',
        bgColor: '#f3e8ff'
      });
    }
    
    if (content.includes('javascript') || content.includes('js')) {
      tags.push({
        label: 'JavaScript',
        icon: 'fab fa-js-square',
        color: '#f7df1e',
        bgColor: '#fffbcc'
      });
    }
    
    return tags;
  };

  const renderPaginationButtons = () => {
    if (!pagination) return null;

    const buttons = [];
    const { current_page, total_pages, has_previous, has_next } = pagination;

    // Previous button
    if (has_previous) {
      buttons.push(
        <button
          key="prev"
          onClick={() => handlePageChange(current_page - 1)}
          className="pagination-btn pagination-nav"
        >
          ← Previous
        </button>
      );
    }

    // Page number buttons
    const startPage = Math.max(1, current_page - 2);
    const endPage = Math.min(total_pages, current_page + 2);

    // First page and ellipsis
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="pagination-ellipsis">
            ...
          </span>
        );
      }
    }

    // Page numbers around current page
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === current_page ? 'current' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page and ellipsis
    if (endPage < total_pages) {
      if (endPage < total_pages - 1) {
        buttons.push(
          <span key="ellipsis2" className="pagination-ellipsis">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={total_pages}
          onClick={() => handlePageChange(total_pages)}
          className="pagination-btn"
        >
          {total_pages}
        </button>
      );
    }

    // Next button
    if (has_next) {
      buttons.push(
        <button
          key="next"
          onClick={() => handlePageChange(current_page + 1)}
          className="pagination-btn pagination-nav"
        >
          Next →
        </button>
      );
    }

    return buttons;
  };

  if (loading) {
    return (
      <>
        <div className="grain-overlay"></div>
        <Header currentPage="home" />
        <main className="main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading amazing projects...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="grain-overlay"></div>
        <Header currentPage="home" />
        <main className="main">
          <div className="error-container">
            <h1>Error loading posts: {error}</h1>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="grain-overlay"></div>
      
      <Header currentPage="home" />

      <main className="main">
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Discover Amazing
              <span className="gradient-text">&nbsp;Open-source Projects</span>
            </h1>
            <p className="hero-description">
              Curating the best open-source projects, hidden gems, and innovative tools that are shaping the future of development.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{pagination?.total_items || 0}</span>
                <span className="stat-label">Projects Featured</span>
              </div>
              <div className="stat">
                <span className="stat-number">∞</span>
                <span className="stat-label">Possibilities</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Open Source</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="code-window">
              <div className="window-header">
                <div className="window-controls">
                  <span className="control close"></span>
                  <span className="control minimize"></span>
                  <span className="control maximize"></span>
                </div>
                <span className="window-title">open-source-projects.json</span>
              </div>
              <div className="code-content">
                <pre><code>{`{
  "mission": "showcase_amazing_projects",
  "focus": ["innovation", "quality", "community"],
  "hidden_gems": true,
  "trending": true,
  "status": "actively_curated"
}`}</code></pre>
              </div>
            </div>
          </div>
        </section>

        <section className="projects-section">
          <div className="section-header">
            <h2 className="section-title">Featured Projects</h2>
            <p className="section-description">
              Hand-picked open-source projects that are making waves in the developer community
            </p>
          </div>

          <div className="projects-grid">
            {posts.map((post, index) => {
              const projectTags = getProjectTags(post);
              const repoName = getRepoName(post.github_repo);
              
              return (
                <article key={post.id} className="project-card" style={{animationDelay: `${(index % 6) * 0.1}s`}}>
                  {/* Project Image */}
                  <div className="card-image">
                    <Image 
                      src={post.github_card_image || getFallbackImage()} 
                      alt={getProjectTitle(post.content)}
                      width={400}
                      height={200}
                      onError={(e) => {
                        e.target.src = getFallbackImage();
                      }}
                      unoptimized
                    />
                    <div className="card-image-overlay">
                      <div className="project-tags">
                        {projectTags.slice(0, 2).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex} 
                            className="project-tag"
                            style={{
                              color: tag.color,
                              backgroundColor: tag.bgColor
                            }}
                          >
                            <i className={tag.icon}></i>
                            <span>{tag.label}</span>
                          </span>
                        ))}
                      </div>
                      <div className="bookmark-container">
                        <BookmarkButton post={post} size="normal" />
                      </div>
                    </div>
                  </div>

                  <div className="card-header">
                    <div className="card-meta">
                      <span className="card-category">Open Source</span>
                      <time className="card-date" dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </time>
                    </div>
                  </div>

                  <div className="card-content">
                    <h3 className="card-title">
                      <Link href={`/post/${post.conversation_id}`}>
                        {getProjectTitle(post.content)}
                      </Link>
                    </h3>
                    <p className="card-excerpt">
                      By @{post.username} • {getProjectTitle(post.content)}
                    </p>
                    
                    {/* Repository Information */}
                    {post.github_repo && (
                      <div className="repo-info">
                        <a
                          href={post.github_repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="repo-link"
                        >
                          <i className="fab fa-github"></i>
                          <span>{repoName}</span>
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <div className="card-links">
                      {/* Additional tags if more than 2 */}
                      {projectTags.length > 2 && (
                        <div className="additional-tags">
                          {projectTags.slice(2).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex} 
                              className="project-tag small"
                              style={{
                                color: tag.color,
                                backgroundColor: tag.bgColor
                              }}
                            >
                              <i className={tag.icon}></i>
                              <span>{tag.label}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link href={`/post/${post.conversation_id}`} className="read-more">
                      <span>Learn More</span>
                      <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="pagination">
              {renderPaginationButtons()}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        /* Card Image Styles */
        .card-image {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.3s ease;
        }

        .project-card:hover .card-image img {
          transform: scale(1.05);
        }

        .card-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.1) 0%,
            transparent 30%,
            transparent 70%,
            rgba(0, 0, 0, 0.3) 100%
          );
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px;
        }

        .project-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-self: flex-start;
        }

        .bookmark-container {
          align-self: flex-end;
          display: flex;
          justify-content: flex-end;
        }

        .project-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .project-tag.small {
          padding: 2px 6px;
          font-size: 10px;
        }

        .project-tag:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .project-tag i {
          font-size: 10px;
        }

        .project-tag.small i {
          font-size: 9px;
        }

        /* Repository Info Styles - adapt to existing card colors */
        .repo-info {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .repo-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #ffffff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
        }

        .repo-link:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
        }

        .repo-link i:first-child {
          font-size: 16px;
        }

        .repo-link i:last-child {
          font-size: 10px;
          opacity: 0.7;
        }

        /* Additional Tags in Footer */
        .additional-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
        }

        /* Responsive adjustments for new elements only */
        @media screen and (max-width: 768px) {
          .card-image {
            height: 160px;
          }

          .card-image-overlay {
            padding: 12px;
          }

          .project-tags {
            gap: 6px;
          }

          .project-tag {
            padding: 3px 6px;
            font-size: 10px;
          }

          .additional-tags {
            justify-content: center;
          }

          .repo-link {
            font-size: 13px;
            padding: 5px 10px;
          }
        }

        @media screen and (max-width: 480px) {
          .card-image {
            height: 140px;
          }

          .project-tag {
            padding: 2px 5px;
            font-size: 9px;
          }

          .project-tag i {
            font-size: 8px;
          }
        }
      `}</style>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomePageClient({ initialData, currentPage = 1 }) {
  const [posts, setPosts] = useState(initialData?.threads || []);
  const [pagination, setPagination] = useState(initialData?.pagination || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  
  const router = useRouter();

  useEffect(() => {
    // If we have initial data, don't fetch again
    if (initialData) {
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const url = currentPage === 1 
          ? 'https://twitter-api.opensourceprojects.dev/threads'
          : `https://twitter-api.opensourceprojects.dev/threads?page=${currentPage}`;
        
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
  }, [currentPage, initialData]);

  const handlePageChange = (page) => {
    if (page === 1) {
      router.push('/');
    } else {
      router.push(`/?page=${page}`);
    }
  };

  // Function to get fallback image
  const getFallbackImage = () => '/images/opinion-fallback.svg';

  // Function to get hero image with fallback
  const getHeroImage = (post) => {
    return post.github_card_image || getFallbackImage();
  };

  // Function to get source label
  const getSourceLabel = (post) => {
    return post.github_repo ? 'GitHub Repo' : 'Opinion';
  };

  // Function to extract project title from content
  const getProjectTitle = (content) => {
    const firstLine = content.split('\\n')[0];
    return firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine || 'Open Source Project';
  };

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to extract tags
  const extractTags = (content) => {
    const hashtagRegex = /#(\\w+)/g;
    const hashtags = content.match(hashtagRegex) || [];
    return hashtags.map(tag => tag.substring(1)).slice(0, 3); // Show max 3 tags
  };

  if (loading) {
    return (
      <>
        <div className="grain-overlay"></div>
        <header className="header">
          <nav className="nav">
            <div className="nav-brand">
              <Link href="/" className="brand-link">
                <Image 
                  src="/images/open-source-projects-dark-mini.png"
                  alt="Open-source Projects"
                  width={200}
                  height={40}
                  className="brand-logo"
                  priority
                  unoptimized
                />
              </Link>
            </div>
            <div className="nav-links">
              <Link href="/" className="nav-link active">
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
              <h2>Loading amazing projects...</h2>
              <p>Please wait while we fetch the latest open-source projects for you.</p>
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
                <Image 
                  src="/images/open-source-projects-dark-mini.png"
                  alt="Open-source Projects"
                  width={200}
                  height={40}
                  className="brand-logo"
                  priority
                  unoptimized
                />
              </Link>
            </div>
            <div className="nav-links">
              <Link href="/" className="nav-link active">
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
              <h1>Unable to Load Projects</h1>
              <p>We&apos;re having trouble loading the projects right now. Please try again later.</p>
              <p className="error-details">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                <i className="fas fa-redo"></i>
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="grain-overlay"></div>
      
      <header className="header">
        <nav className="nav">
          <div className="nav-brand">
            <Link href="/" className="brand-link">
              <Image 
                src="/images/open-source-projects-dark-mini.png"
                alt="Open-source Projects"
                width={200}
                height={40}
                className="brand-logo"
                priority
                unoptimized
              />
            </Link>
          </div>
          <div className="nav-links">
            <Link href="/" className="nav-link active">
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
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-content">
              <h1 className="hero-title">
                Discover the Best <span className="highlight">Open Source</span> Projects
              </h1>
              <p className="hero-description">
                Explore our curated collection of amazing open-source projects from GitHub. 
                Find trending repositories, hidden gems, and tools that can accelerate your development.
              </p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">{posts.length}+</span>
                  <span className="stat-label">Projects</span>
                </div>
                <div className="stat">
                  <span className="stat-number">GitHub</span>
                  <span className="stat-label">Powered</span>
                </div>
                <div className="stat">
                  <span className="stat-number">Daily</span>
                  <span className="stat-label">Updates</span>
                </div>
              </div>
            </div>
          </section>

          {/* Projects Grid */}
          <section className="projects">
            <div className="projects-header">
              <h2 className="section-title">
                <i className="fas fa-code"></i>
                Latest Projects
              </h2>
              <div className="projects-count">
                Showing {posts.length} projects
                {pagination && ` • Page ${pagination.current_page} of ${pagination.total_pages}`}
              </div>
            </div>

            <div className="projects-grid">
              {posts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/post/${post.id}`} 
                  className="project-card"
                >
                  <div className="card-image">
                    <Image 
                      src={getHeroImage(post)} 
                      alt={getProjectTitle(post.content)}
                      width={350}
                      height={200}
                      onError={(e) => {
                        e.target.src = getFallbackImage();
                      }}
                      unoptimized
                    />
                    <div className="card-overlay">
                      <span className="source-badge">
                        <i className={post.github_repo ? "fab fa-github" : "fas fa-comment-alt"}></i>
                        {getSourceLabel(post)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <h3 className="card-title">
                      {getProjectTitle(post.content)}
                    </h3>
                    
                    <div className="card-meta">
                      <div className="card-author">
                        <i className="fas fa-user"></i>
                        <span>@{post.username}</span>
                      </div>
                      <div className="card-date">
                        <i className="fas fa-calendar"></i>
                        <span>{formatDate(post.date)}</span>
                      </div>
                    </div>

                    {extractTags(post.content).length > 0 && (
                      <div className="card-tags">
                        {extractTags(post.content).map((tag, index) => (
                          <span key={index} className="tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_previous}
                  className="btn btn-outline"
                >
                  <i className="fas fa-chevron-left"></i>
                  Previous
                </button>
                
                <div className="pagination-info">
                  Page {pagination.current_page} of {pagination.total_pages}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_next}
                  className="btn btn-outline"
                >
                  Next
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </section>
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

      {/* Add the same styles as before */}
      <style jsx global>{`
        /* Brand logo styles */
        .brand-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #f0f6fc;
          font-weight: 700;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .brand-link:hover {
          color: #58a6ff;
          transform: translateY(-1px);
        }

        .brand-logo {
          height: auto;
          max-height: 40px;
          width: auto;
          transition: all 0.3s ease;
        }

        .brand-logo:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }

        /* Your existing styles would go here */
        /* I'll add key styles for the new components */
        
        .hero {
          text-align: center;
          padding: 4rem 0;
          margin-bottom: 3rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          color: #f0f6fc;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .highlight {
          background: linear-gradient(135deg, #58a6ff 0%, #79c0ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          color: #8b949e;
          max-width: 600px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-top: 2rem;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: #58a6ff;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .projects-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          color: #f0f6fc;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .projects-count {
          color: #8b949e;
          font-size: 0.9rem;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .project-card {
          background: rgba(13, 17, 23, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid #30363d;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .project-card:hover {
          transform: translateY(-4px);
          border-color: #58a6ff;
          box-shadow: 0 8px 32px rgba(88, 166, 255, 0.15);
        }

        .card-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .card-image img,
        .card-image Image {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .project-card:hover .card-image img,
        .project-card:hover .card-image Image {
          transform: scale(1.05);
        }

        .card-overlay {
          position: absolute;
          top: 1rem;
          right: 1rem;
        }

        .source-badge {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-content {
          padding: 1.5rem;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #f0f6fc;
          margin-bottom: 1rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          font-size: 0.85rem;
          color: #8b949e;
        }

        .card-author,
        .card-date {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          background: rgba(88, 166, 255, 0.1);
          color: #58a6ff;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          margin-top: 3rem;
        }

        .pagination-info {
          color: #8b949e;
          font-size: 0.9rem;
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

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-outline {
          background: transparent;
          color: #8b949e;
          border: 1px solid #30363d;
        }

        .btn-outline:hover:not(:disabled) {
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

        /* Responsive design */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-stats {
            gap: 2rem;
          }

          .projects-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .projects-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}

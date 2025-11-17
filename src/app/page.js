'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import BookmarkButton from './components/BookmarkButton';
import NewsletterForm from './components/NewsletterForm';

function HomePageContent() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [activeSponsors, setActiveSponsors] = useState([]);

  // Load Carbon Cover ad only on the homepage
  useEffect(() => {
    const container = document.getElementById('carbon-cover');
    if (!container) return;
    // avoid injecting twice
    if (document.getElementById('_carbonads_js_home')) return;

    // add a small fallback visible placeholder so devs can see something when ad is blocked
    let fallback = document.createElement('div');
    fallback.className = 'carbon-fallback';
    fallback.textContent = 'Advertisement';
    container.appendChild(fallback);

    const script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    // use explicit https to avoid protocol issues
    script.src = 'https://cdn.carbonads.com/carbon.js?serve=CW7IL2QN&placement=wwwopensourceprojectsdev&format=cover';
    script.id = '_carbonads_js_home';

    script.onload = () => {
      console.info('[Carbon] homepage ad script loaded');
      // remove fallback if ad successfully loaded
      if (fallback && fallback.parentNode) fallback.parentNode.removeChild(fallback);
    };

    script.onerror = (e) => {
      console.warn('[Carbon] homepage ad failed to load', e);
      if (fallback) {
        fallback.textContent = 'Ad blocked or failed to load';
        fallback.classList.add('carbon-fallback-error');
      }
    };

    container.appendChild(script);

    // Detect whether Carbon injected its ad markup into the container
    const observer = new MutationObserver((mutations) => {
      if (container.querySelector('.carbon-wrap, #carbonads, .carbon')) {
        console.info('[Carbon] homepage ad markup detected in container');
        if (fallback && fallback.parentNode) fallback.parentNode.removeChild(fallback);
        observer.disconnect();
        clearTimeout(timeoutId);
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    const timeoutId = setTimeout(() => {
      console.warn('[Carbon] homepage ad did not render within timeout; likely blocked or no inventory');
      if (fallback) {
        fallback.textContent = 'Ad not rendered (blocked or no inventory)';
        fallback.classList.add('carbon-fallback-error');
      }
      observer.disconnect();
    }, 6000);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      if (fallback && fallback.parentNode) fallback.parentNode.removeChild(fallback);
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  // Fetch active sponsors from API
  const fetchActiveSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors?active=true&shuffle=true');
      if (response.ok) {
        const data = await response.json();
        setActiveSponsors(data.sponsors || []);
      }
    } catch (error) {
      console.error('Failed to fetch sponsors:', error);
      setActiveSponsors([]);
    }
  };

  // Update active sponsors on component mount and daily
  useEffect(() => {
    // Fetch immediately
    fetchActiveSponsors();
    
    // Update daily at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - now;
    
    const dailyUpdate = setInterval(fetchActiveSponsors, 24 * 60 * 60 * 1000);
    const initialUpdate = setTimeout(() => {
      fetchActiveSponsors();
      // Start daily updates after first midnight update
      setInterval(fetchActiveSponsors, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
    
    return () => {
      clearInterval(dailyUpdate);
      clearTimeout(initialUpdate);
    };
  }, []);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page')) || 1;

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Toast Component
  const Toast = ({ show, message, type }) => {
    if (!show) return null;

    const getIcon = () => {
      switch (type) {
        case 'success':
          return 'fas fa-check-circle';
        case 'error':
          return 'fas fa-exclamation-circle';
        case 'info':
          return 'fas fa-info-circle';
        default:
          return 'fas fa-check-circle';
      }
    };

    const getColor = () => {
      switch (type) {
        case 'success':
          return '#28a745';
        case 'error':
          return '#dc3545';
        case 'info':
          return '#17a2b8';
        default:
          return '#28a745';
      }
    };

    return (
      <div
        className="toast-notification"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(13, 17, 23, 0.95)',
          backdropFilter: 'blur(15px)',
          border: `1px solid ${getColor()}`,
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#f0f6fc',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 10000,
          minWidth: '280px'
        }}
      >
        <i className={getIcon()} style={{ color: getColor(), fontSize: 18, flexShrink: 0 }} />
        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{message}</span>
      </div>
    );
  };

  // Initialize filters from URL params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'latest';
    setSearchQuery(search);
    setAppliedSearchQuery(search);
    setSortOrder(sort);
  }, [searchParams]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          type: 'github'
        });
        
        if (currentPage > 1) {
          params.append('page', currentPage.toString());
        }
        
        if (appliedSearchQuery.trim()) {
          params.append('search', appliedSearchQuery.trim());
        }
        
        if (sortOrder && sortOrder !== 'latest') {
          params.append('sort', sortOrder);
        }
        
        const url = `https://lb2-twitter-api.opensourceprojects.dev/threads?${params.toString()}`;
        
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
  }, [currentPage, appliedSearchQuery, sortOrder]);

  const updateURL = (newFilters = {}, shouldScroll = false) => {
    const params = new URLSearchParams();
    
    const search = newFilters.search !== undefined ? newFilters.search : appliedSearchQuery;
    const sort = newFilters.sort !== undefined ? newFilters.sort : sortOrder;
    const page = newFilters.page !== undefined ? newFilters.page : 1;
    
    if (search.trim()) {
      params.append('search', search.trim());
    }
    
    if (sort && sort !== 'latest') {
      params.append('sort', sort);
    }
    
    if (page > 1) {
      params.append('page', page.toString());
    }
    
    const newURL = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newURL, { scroll: shouldScroll });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedSearchQuery(searchQuery);
    updateURL({ search: searchQuery, page: 1 });
  };

  const handleSortChange = (newSort) => {
    setSortOrder(newSort);
  };

  const handleSortApply = (newSort) => {
    setSortOrder(newSort);
    updateURL({ sort: newSort, page: 1 });
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
    setSortOrder('latest');
    router.push('/', { scroll: false });
  };

  const handlePageChange = (page) => {
    updateURL({ page }, true); // true = scroll to top for pagination
  };

  // Function to get fallback image
  const getFallbackImage = () => {
    return '/images/open-source-logo-830x460.jpg';
  };

  // Format large numbers into short form (k, m, b)
  const formatImpressions = (num) => {
    const n = Number(num) || 0;
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'b';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
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
              <div className="newsletter-container">
                <NewsletterForm source="home_page" />
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

          {/* Filter Controls */}
          <div className="filters-container">
            <div className="filters-wrapper">
              <div className="search-wrapper">
                <form onSubmit={handleSearch} className="search-form">
                  <div className="search-input-container">
                    <i className="fas fa-search search-icon"></i>
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      className="search-input"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setAppliedSearchQuery('');
                          updateURL({ search: '', page: 1 });
                        }}
                        className="clear-search-btn"
                        aria-label="Clear search"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                  <button type="submit" className="search-btn">
                    Search
                  </button>
                </form>
              </div>

              <div className="sort-wrapper">
                <label className="sort-label">
                  <i className="fas fa-sort sort-icon"></i>
                  Sort by:
                </label>
                <div className="sort-buttons">
                  <button
                    type="button"
                    onClick={() => handleSortApply('latest')}
                    className={`sort-btn ${sortOrder === 'latest' ? 'active' : ''}`}
                  >
                    Latest
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSortApply('oldest')}
                    className={`sort-btn ${sortOrder === 'oldest' ? 'active' : ''}`}
                  >
                    Oldest
                  </button>
                    <button
                      type="button"
                      onClick={() => handleSortApply('views')}
                      className={`sort-btn trending ${sortOrder === 'views' ? 'active' : ''}`}
                    >
                      <i className="fas fa-chart-line"></i>
                      <span style={{marginLeft: '6px'}}>Trending</span>
                    </button>
                </div>
              </div>

              {(appliedSearchQuery || sortOrder !== 'latest') && (
                <div className="filters-actions">
                  <button
                    onClick={clearFilters}
                    className="clear-filters-btn"
                  >
                    <i className="fas fa-times-circle"></i>
                    Clear Filters
                  </button>
                  <div className="active-filters">
                    {appliedSearchQuery && (
                      <span className="filter-tag">
                        {"Search: \"" + appliedSearchQuery + "\""}
                      </span>
                    )}
                    {sortOrder !== 'latest' && (
                      <span className="filter-tag">
                        Sort: {sortOrder === 'oldest' ? 'Oldest' : (sortOrder === 'views' ? 'Trending' : 'Latest')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Results count - only show when filters are applied */}
            {pagination && (appliedSearchQuery || sortOrder !== 'latest') && (
              <div className="results-info">
                <p className="results-count">
                  {appliedSearchQuery ? 'Found' : 'Showing'} {pagination.total_items} project{pagination.total_items !== 1 ? 's' : ''}
                  {appliedSearchQuery && ` for "${appliedSearchQuery}"`}
                  {pagination.total_pages > 1 && ` (Page ${pagination.current_page} of ${pagination.total_pages})`}
                </p>
              </div>
            )}
          </div>

          <div className="projects-grid">
            {/* Carbon Cover ad - homepage only. The script will inject the ad markup here. */}
            <div id="carbon-cover" className="carbon-ad-container" aria-hidden="false"></div>
            {posts.map((post, index) => {
              // Dynamic sponsor placement - reserve positions 2, 3, and 4 for sponsors
              const sponsorAtPosition2 = index === 1 && activeSponsors[0];
              const sponsorAtPosition3 = index === 2 && activeSponsors[1];
              const sponsorAtPosition4 = index === 3 && activeSponsors[2];
              const currentSponsor = sponsorAtPosition2 ? activeSponsors[0] : 
                                    (sponsorAtPosition3 ? activeSponsors[1] : 
                                    (sponsorAtPosition4 ? activeSponsors[2] : null));
              
              // Show sponsor us card after all active sponsors
              const shouldShowSponsorUs = index === (1 + activeSponsors.length);
              
              const projectTags = getProjectTags(post);
              const repoName = getRepoName(post.github_repo);
              
              return (
                <React.Fragment key={`post-${post.id}-${index}`}>
                  {currentSponsor && (
                    <article key={`sponsor-${currentSponsor.id}`} className="project-card sponsor-card" style={{animationDelay: `${(index % 6) * 0.1}s`}}>
                      {/* Dynamic Sponsored Project Image */}
                      <div className="card-image">
                        <Image 
                          src={currentSponsor.image}
                          alt={currentSponsor.description}
                          width={400}
                          height={200}
                          unoptimized
                        />
                        <a
                          className="image-link-overlay"
                          href={currentSponsor.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={currentSponsor.description}
                        />
                        <div className="card-image-overlay">
                          <div className="project-tags">
                            {currentSponsor.tags.slice(0, 2).map((tag, tagIndex) => (
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
                          <div className="sponsored-badge">
                            <span className="sponsor-tag">
                              <i className="fas fa-star"></i>
                              <span>SPONSORED</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="card-header">
                        <div className="card-meta">
                          <span className="card-category sponsor-category">Sponsored Project</span>
                          <span className="sponsor-highlight">Featured</span>
                        </div>
                      </div>

                      <div className="card-content">
                        <h3 className="card-title">
                          <a 
                            href={currentSponsor.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{textDecoration: 'none', color: 'inherit'}}
                          >
                            {currentSponsor.description}
                          </a>
                        </h3>
                        <p className="card-excerpt">
                          {currentSponsor.tagline}
                        </p>
                        
                        <div className="repo-info">
                          <a
                            href={currentSponsor.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="repo-link"
                          >
                            <i className="fab fa-github"></i>
                            <span>{currentSponsor.repo}</span>
                            <i className="fas fa-external-link-alt"></i>
                          </a>
                        </div>
                      </div>

                      <div className="card-footer">
                        <div className="card-links">
                          <div className="additional-tags">
                            {currentSponsor.tags.slice(2).map((tag, tagIndex) => (
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
                        </div>
                        <a 
                          href={currentSponsor.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="read-more"
                        >
                          <span>Learn More</span>
                          <i className="fas fa-arrow-right"></i>
                        </a>
                      </div>
                    </article>
                  )}

                  {shouldShowSponsorUs && (
                    <article key="sponsor-us-card" className="project-card sponsor-card" style={{animationDelay: `${(index % 6) * 0.1}s`}}>
                      {/* Sponsor Us Card Image */}
                      <div className="card-image sponsor-image">
                        <Image 
                          src="/images/sponsor.jpg"
                          alt="Sponsor This Spot - Showcase Your Project"
                          width={400}
                          height={200}
                          unoptimized
                        />
                        <Link href="/sponsor-us" className="image-link-overlay" aria-label="Sponsor This Spot - Showcase Your Project" />
                        <div className="card-image-overlay sponsor-overlay">
                          <div className="sponsor-badge">
                            <span className="sponsor-tag">
                              <i className="fas fa-star"></i>
                              <span>Sponsored Spot</span>
                            </span>
                          </div>
                          <div className="sponsor-cta">
                            <i className="fas fa-rocket"></i>
                          </div>
                        </div>
                      </div>

                      <div className="card-header">
                        <div className="card-meta">
                          <span className="card-category sponsor-category">Sponsorship</span>
                          <span className="sponsor-availability">Available Now</span>
                        </div>
                      </div>

                      <div className="card-content">
                        <h3 className="card-title sponsor-title">
                          <Link href="/sponsor-us">
                            Showcase Your Project Here
                          </Link>
                        </h3>
                        <p className="card-excerpt sponsor-excerpt">
                          Claim this premium spot to showcase your project to thousands of developers. Get maximum visibility for your open-source work.
                        </p>
                        
                        <div className="sponsor-features">
                          <div className="sponsor-feature">
                              <i className="fas fa-chart-line"></i>
                              <span>Prime Visibility</span>
                            </div>
                        </div>
                      </div>

                      <div className="card-footer sponsor-footer">
                        <Link href="/sponsor-us" className="sponsor-cta-button">
                          <span>Claim This Spot</span>
                          <i className="fas fa-arrow-right"></i>
                        </Link>
                      </div>
                    </article>
                  )}
                  
                  <article key={post.id} className="project-card" style={{animationDelay: `${((index + (currentSponsor ? 1 : 0) + (shouldShowSponsorUs ? 1 : 0)) % 6) * 0.1}s`}}>
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
                      <Link href={`/post/${post.conversation_id}`} className="image-link-overlay" aria-label={getProjectTitle(post.content)} />
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
                          <BookmarkButton 
                            post={post} 
                            size="normal" 
                            onBookmarkChange={(isBookmarked) => {
                              if (isBookmarked) {
                                showToast('Project bookmarked! ✨', 'success');
                              } else {
                                showToast('Bookmark removed', 'info');
                              }
                            }}
                          />
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
                          {/* Impressions (view_count) */}
                          {post.view_count !== undefined && (
                            <span className="card-impressions" title={`${post.view_count} impressions`} style={{marginLeft: '8px'}}>
                              <i className="fas fa-chart-line" aria-hidden="true"></i>
                              <span className="impressions-label">Impressions</span>
                              <span className="impressions-value">&nbsp;{formatImpressions(post.view_count)}</span>
                            </span>
                          )}
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
                </React.Fragment>
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

      {/* Toast Notification */}
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <style jsx global>{`
        .newsletter-container {
          margin-top: 2.5rem;
        }

        /* Card Image Styles */
        .card-image {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        /* Ensure link that wraps the image fills the card so clicks land on the anchor */
        .card-image > a {
          display: block;
          width: 100%;
          height: 100%;
        }

        /* Make any image or image wrapper inside the anchor fill the container */
        .card-image > a img,
        .card-image > a picture,
        .card-image > a > span,
        .card-image > a > div {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
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
          /* allow clicks to pass through to underlying image/link by default */
          pointer-events: none;
        }

        /* Make interactive overlay children still receive pointer events */
        .card-image-overlay .project-tags,
        .card-image-overlay .bookmark-container,
        .card-image-overlay .sponsored-badge {
          pointer-events: auto;
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

        /* Absolute overlay link that covers the image area to reliably capture clicks */
        .image-link-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1; /* below overlay children which have higher z-index */
          display: block;
        }

        /* Ensure interactive overlay children float above the image link */
        .card-image-overlay,
        .card-image-overlay .project-tags,
        .card-image-overlay .bookmark-container,
        .sponsored-badge {
          position: relative;
          z-index: 2;
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

        /* Sponsored Badge Styles */
        .sponsored-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
        }

        .sponsor-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
          animation: sponsor-pulse 2s ease-in-out infinite alternate;
        }

        @keyframes sponsor-pulse {
          0% { 
            box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
            transform: scale(1);
          }
          100% { 
            box-shadow: 0 6px 25px rgba(255, 107, 53, 0.6);
            transform: scale(1.05);
          }
        }

        .sponsor-tag i {
          font-size: 10px;
        }

        /* Sponsor Card Specific Styles */
        .sponsor-card {
          border: 2px solid rgba(255, 107, 53, 0.3);
          background: linear-gradient(135deg, 
            rgba(255, 107, 53, 0.05) 0%,
            rgba(13, 17, 23, 0.95) 20%,
            rgba(13, 17, 23, 0.95) 100%);
          position: relative;
          overflow: hidden;
        }

        .sponsor-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ff6b35, #f7931e, #ff6b35);
          animation: sponsor-border-flow 3s ease-in-out infinite;
        }

        @keyframes sponsor-border-flow {
          0%, 100% { 
            background-position: 0% 50%;
          }
          50% { 
            background-position: 100% 50%;
          }
        }

        .sponsor-card:hover {
          border-color: rgba(255, 107, 53, 0.5);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(255, 107, 53, 0.2);
        }

        .sponsor-category {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sponsor-highlight {
          background: rgba(255, 107, 53, 0.1);
          color: #ff6b35;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255, 107, 53, 0.3);
        }

        /* Sponsor Us Card Specific Styles */
        .sponsor-image {
          position: relative;
        }

        .sponsor-overlay {
          background: linear-gradient(
            to bottom,
            rgba(255, 107, 53, 0.2) 0%,
            transparent 30%,
            transparent 70%,
            rgba(255, 107, 53, 0.4) 100%
          );
        }

        .sponsor-availability {
          background: rgba(76, 175, 80, 0.1);
          color: #4CAF50;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid rgba(76, 175, 80, 0.3);
        }

        .sponsor-features {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .sponsor-feature {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #8b949e;
          font-size: 12px;
        }

        .sponsor-feature i {
          color: #ff6b35;
          font-size: 14px;
        }

        .sponsor-footer {
          border-top: 1px solid rgba(255, 107, 53, 0.2);
        }

        .sponsor-cta-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          border: none;
          width: 100%;
          justify-content: center;
        }

        .sponsor-cta-button:hover {
          background: linear-gradient(135deg, #e55a2b, #e67e1a);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
        }

        .sponsor-cta {
          color: #ff6b35;
          font-size: 24px;
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

          /* Ensure no horizontal overflow */
          .repo-info, .card-content, .card-footer {
            width: 100%;
            max-width: 100%;
            overflow-wrap: break-word;
          }

          /* Sponsored elements mobile styles */
          .sponsored-badge {
            top: 8px;
            right: 8px;
          }

          .sponsor-tag {
            padding: 4px 8px;
            font-size: 9px;
            gap: 4px;
          }

          .sponsor-tag i {
            font-size: 8px;
          }

          .sponsor-category,
          .sponsor-highlight {
            font-size: 9px;
            padding: 3px 6px;
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

          /* Additional mobile fixes */
          .card-image-overlay {
            padding: 8px;
          }

          .repo-link {
            font-size: 12px;
            padding: 4px 8px;
            gap: 6px;
          }

          .project-tags {
            gap: 4px;
          }

          .additional-tags {
            gap: 4px;
          }

          /* Ensure text doesn't overflow */
          .card-title, .card-excerpt {
            word-break: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
          }

          /* Sponsored elements extra small mobile styles */
          .sponsored-badge {
            top: 6px;
            right: 6px;
          }

          .sponsor-tag {
            padding: 3px 6px;
            font-size: 8px;
            gap: 3px;
          }

          .sponsor-tag i {
            font-size: 7px;
          }

          .sponsor-category,
          .sponsor-highlight {
            font-size: 8px;
            padding: 2px 4px;
          }
        }

        /* Toast Animation */
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Mobile responsive toast */
        @media screen and (max-width: 768px) {
          .toast-notification {
            top: 10px !important;
            right: 10px !important;
            left: 10px !important;
            min-width: auto !important;
            max-width: none !important;
            padding: 12px 16px !important;
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

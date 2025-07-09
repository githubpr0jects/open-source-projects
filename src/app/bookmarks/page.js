'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function BookmarksPage() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load bookmarks from localStorage
    const loadBookmarks = () => {
      try {
        const savedBookmarks = localStorage.getItem('bookmarkedPosts');
        if (savedBookmarks) {
          const bookmarks = JSON.parse(savedBookmarks);
          setBookmarkedPosts(bookmarks);
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, []);

  const removeBookmark = (postId) => {
    const updatedBookmarks = bookmarkedPosts.filter(post => post.id !== postId);
    setBookmarkedPosts(updatedBookmarks);
    localStorage.setItem('bookmarkedPosts', JSON.stringify(updatedBookmarks));
  };

  // Function to get clean project title without URLs
  const getProjectTitle = (content) => {
    const firstLine = content.split(/\\n|\n/)[0];
    const titleWithoutUrls = firstLine.replace(/https?:\/\/[^\s]+/g, '').trim();
    const cleanTitle = titleWithoutUrls || 'Open Source Project';
    return cleanTitle.length > 80 ? cleanTitle.substring(0, 80) + '...' : cleanTitle;
  };

  const getFallbackImage = () => {
    return '/images/open-source-logo-830x460.jpg';
  };

  if (loading) {
    return (
      <>
        <div className="grain-overlay"></div>
        <Header currentPage="bookmarks" />
        <main className="main">
          <div className="container">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <h2>Loading bookmarks...</h2>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="grain-overlay"></div>
      <Header currentPage="bookmarks" />
      
      <main className="main">
        <div className="container">
          {/* Page Header */}
          <section className="bookmarks-header">
            <div className="header-content">
              <h1 className="page-title">
                <i className="fas fa-bookmark"></i>
                Your Bookmarked Projects
              </h1>
              <p className="page-description">
                Projects you&apos;ve saved for later reading. All bookmarks are stored locally in your browser.
              </p>
              <div className="bookmarks-stats">
                <span className="stat">
                  <i className="fas fa-heart"></i>
                  {bookmarkedPosts.length} saved project{bookmarkedPosts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </section>

          {/* Bookmarked Posts */}
          {bookmarkedPosts.length === 0 ? (
            <section className="empty-bookmarks">
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fas fa-bookmark"></i>
                </div>
                <h2>No bookmarks yet</h2>
                <p>Start bookmarking projects you find interesting to see them here.</p>
                <Link href="/" className="btn btn-primary">
                  <i className="fas fa-search"></i>
                  <span>Discover Projects</span>
                </Link>
              </div>
            </section>
          ) : (
            <section className="bookmarked-projects">
              <div className="projects-grid">
                {bookmarkedPosts.map((post) => (
                  <article key={post.id} className="project-card bookmarked">
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
                        <button 
                          onClick={() => removeBookmark(post.id)}
                          className="bookmark-btn bookmarked"
                          title="Remove bookmark"
                        >
                          <i className="fas fa-bookmark"></i>
                        </button>
                      </div>
                    </div>

                    <div className="card-header">
                      <div className="card-meta">
                        <span className="card-category">
                          {post.github_repo ? 'GitHub Repo' : 'Opinion'}
                        </span>
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
                    </div>

                    <div className="card-footer">
                      <Link href={`/post/${post.conversation_id}`} className="read-more">
                        <span>Read More</span>
                        <i className="fas fa-arrow-right"></i>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .bookmarks-header {
          text-align: center;
          padding: 3rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 3rem;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #f0f6fc;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .page-title i {
          color: #ffd700;
        }

        .page-description {
          font-size: 1.2rem;
          color: #8b949e;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .bookmarks-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
        }

        .bookmarks-stats .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #58a6ff;
          font-weight: 600;
        }

        .empty-bookmarks {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .empty-state {
          text-align: center;
          max-width: 400px;
        }

        .empty-icon {
          font-size: 4rem;
          color: #30363d;
          margin-bottom: 2rem;
        }

        .empty-state h2 {
          font-size: 2rem;
          color: #f0f6fc;
          margin-bottom: 1rem;
        }

        .empty-state p {
          color: #8b949e;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .bookmarked-projects {
          padding: 2rem 0;
        }

        .project-card.bookmarked {
          position: relative;
        }

        .bookmark-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          color: #8b949e;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .bookmark-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          color: #f0f6fc;
          transform: scale(1.1);
        }

        .bookmark-btn.bookmarked {
          color: #ffd700;
        }

        .bookmark-btn.bookmarked:hover {
          color: #ff6b6b;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .btn-primary {
          background: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #1f6feb 0%, #1a5bd8 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(88, 166, 255, 0.3);
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .page-description {
            font-size: 1rem;
          }

          .bookmarks-stats {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </>
  );
}

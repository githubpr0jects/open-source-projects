import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Loading() {
  return (
    <>
      <div className="grain-overlay"></div>
      <Header currentPage="post" />
      <main className="main">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '1.5rem' }}>
            <a href="/" className="breadcrumb-link">Home</a>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Project</span>
          </nav>
          <div className="project-hero">
            <div className="hero-image-container">
              <div className="hero-image skeleton-hero-image" />
              <div className="hero-overlay"></div>
            </div>
            <div className="project-meta">
              <span className="project-badge skeleton-pulse">&nbsp;</span>
              <span className="project-date skeleton-pulse">&nbsp;</span>
            </div>
          </div>
          <div className="project-content">
            <article className="project-article">
              <div className="article-header">
                <div className="article-header-left">
                  <h2><i className="fas fa-file-alt"></i> Project Description</h2>
                </div>
              </div>
              <div className="article-content">
                <div className="content-section">
                  <div className="section-content">
                    <p className="skeleton-pulse skeleton-line">&nbsp;</p>
                    <p className="skeleton-pulse skeleton-line">&nbsp;</p>
                    <p className="skeleton-pulse skeleton-line short">&nbsp;</p>
                    <p className="skeleton-pulse skeleton-line">&nbsp;</p>
                    <p className="skeleton-pulse skeleton-line">&nbsp;</p>
                    <p className="skeleton-pulse skeleton-line short">&nbsp;</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        .skeleton-pulse {
          background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%);
          background-size: 400% 100%;
          animation: skeleton-shimmer 1.4s ease infinite;
          border-radius: 4px;
          color: transparent !important;
          min-height: 1em;
          display: block;
        }
        .skeleton-hero-image {
          width: 100%;
          height: 100%;
          min-height: 315px;
          border-radius: 12px;
        }
        .project-badge.skeleton-pulse { width: 120px; height: 1.5em; display: inline-block; }
        .project-date.skeleton-pulse { width: 180px; height: 1.5em; display: inline-block; margin-left: 1rem; }
        .skeleton-line { height: 1.2em; margin-bottom: 1rem; width: 100%; }
        .skeleton-line.short { width: 65%; }
        @keyframes skeleton-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>
    </>
  );
}
import Header from './components/Header';
import Footer from './components/Footer';

export default function Loading() {
  return (
    <>
      <div className="grain-overlay"></div>
      <Header currentPage="home" />
      <main className="main">
        <section className="hero">
          <div className="hero-content">
            <div className="issue-line">
              <span className="issue-badge">Issue latest</span>
              <span>Loading edition&hellip;</span>
            </div>
            <h1 className="hero-title">
              <span>Discover Amazing</span><br />
              <span className="gradient-text">Open Source</span><br />
              <span>Projects</span>
            </h1>
            <p className="hero-description">
              Curating the best open-source projects, hidden gems, and innovative tools that are shaping the future of development.
            </p>
          </div>
          <div className="hero-visual">
            <div className="press-run-card">
              <div className="press-run-label">Press run</div>
              <div className="press-stat">
                <span className="press-stat-number skeleton-pulse">&nbsp;</span>
                <span className="press-stat-label">Projects in the index</span>
              </div>
            </div>
          </div>
        </section>
        <section className="projects-section">
          <div className="section-header">
            <div className="section-header-left">
              <div className="section-label-mono">Section II</div>
              <h2 className="section-title">Featured this week</h2>
              <p className="section-description">Hand-picked open source projects that are making waves in the developer community.</p>
            </div>
          </div>
          <div className="projects-grid">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <article key={i} className="project-card postcard-card skeleton-card">
                <div className="postcard-topline">
                  <div className="postcard-tags">
                    <span className="postcard-tag boxed skeleton-pulse">&nbsp;</span>
                    <span className="postcard-tag plain skeleton-pulse">&nbsp;</span>
                  </div>
                </div>
                <div className="card-content postcard-content">
                  <h3 className="card-title postcard-title skeleton-pulse">&nbsp;</h3>
                  <p className="card-excerpt postcard-excerpt skeleton-pulse">&nbsp;</p>
                </div>
                <div className="card-footer postcard-footer">
                  <div className="postcard-meta-line skeleton-pulse">&nbsp;</div>
                </div>
              </article>
            ))}
          </div>
        </section>
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
          display: inline-block;
        }
        .skeleton-card .skeleton-pulse { width: 100%; }
        .postcard-title.skeleton-pulse { width: 80%; height: 1.4em; }
        .postcard-excerpt.skeleton-pulse { width: 60%; height: 1em; margin-top: 0.5rem; }
        .postcard-tag.skeleton-pulse { width: 60px; height: 1.2em; }
        .postcard-meta-line.skeleton-pulse { width: 70%; height: 0.9em; }
        .press-stat-number.skeleton-pulse { width: 60px; }
        @keyframes skeleton-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>
    </>
  );
}
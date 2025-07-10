import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Open-source Projects</h3>
          <p>Discovering and showcasing the best open-source projects and hidden gems in the developer community.</p>
        </div>
        <div className="footer-section">
          <h4>Legal</h4>
          <div className="footer-links">
            <Link href="/about" className="footer-link">About Us</Link>
            <Link href="/privacy" className="footer-link">Privacy Policy</Link>
            <Link href="/cookies" className="footer-link">Cookie Policy</Link>
          </div>
        </div>
        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-links">
            <a href="https://github.com/githubprojects" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://twitter.com/githubprojects" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com/githubprojects" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://threads.net/@githubprojects" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-meta"></i>
            </a>
            <a href="https://bsky.app/profile/githubprojects.bsky.social" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fas fa-cloud"></i>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Open-source Projects. Built with <i className="fas fa-heart"></i> for the community.</p>
      </div>
    </footer>
  );
}

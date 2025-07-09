import Link from 'next/link';
import Image from 'next/image';

export default function Header({ currentPage = 'home' }) {
  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">
          <Link href="/" className="brand-link">
            <Image 
              src="/images/open-source-projects-dark-mini.png"
              alt="Open-source Projects"
              width={180}
              height={32}
              className="brand-logo"
              priority
              unoptimized
            />
          </Link>
        </div>
        <div className="nav-links">
          <Link href="/" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}>
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
  );
}

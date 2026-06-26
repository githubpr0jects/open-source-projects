'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Header({ currentPage = 'home' }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="masthead">
        <Link href="/" className="brand-link">
          opensourceprojects<span>.dev</span>
        </Link>
        <p className="masthead-tagline">A broadsheet for software that doesn't ask for your email</p>
      </div>
      <nav className="nav">
        <div className="nav-links">
          <Link href="/" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}>
            <span>Home</span>
          </Link>
          <Link href="/bookmarks" className={`nav-link ${currentPage === 'bookmarks' ? 'active' : ''}`}>
            <span>Bookmarks</span>
          </Link>
          <Link href="/sponsor-us" className={`nav-link ${currentPage === 'sponsor-us' ? 'active' : ''}`}>
            <span>Sponsors</span>
          </Link>
          {/* <Link href="#" className="nav-link">
            <i className="fas fa-gem"></i>
            <span>Hidden Gems</span>
          </Link> */}
          <Link href="/newsletter" className={`nav-link ${currentPage === 'newsletter' ? 'active' : ''}`}>
            <span>Newsletter</span>
          </Link>
          <Link href="/rss-info" className={`nav-link ${currentPage === 'rss-info' ? 'active' : ''}`}>
            <span>RSS</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

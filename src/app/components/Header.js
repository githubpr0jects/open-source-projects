'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Header({ currentPage = 'home' }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="masthead">
        <button
          className="drawer-toggle"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <span className="drawer-toggle-bar"></span>
          <span className="drawer-toggle-bar"></span>
          <span className="drawer-toggle-bar"></span>
        </button>
        <Link href="/" className="brand-link">
          opensourceprojects<span>.dev</span>
        </Link>
        <p className="masthead-tagline">A broadsheet for software that doesn&apos;t ask for your email</p>
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

      <div className={`drawer-overlay ${drawerOpen ? 'is-visible' : ''}`} onClick={closeDrawer}></div>
      <aside className={`drawer ${drawerOpen ? 'is-open' : ''}`}>
        <div className="drawer-header">
          <Link href="/" className="drawer-brand" onClick={closeDrawer}>
            opensourceprojects<span>.dev</span>
          </Link>
          <button className="drawer-close" onClick={closeDrawer} aria-label="Close menu">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <nav className="drawer-nav">
          <Link href="/" className={`drawer-link ${currentPage === 'home' ? 'active' : ''}`} onClick={closeDrawer}>
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          <Link href="/bookmarks" className={`drawer-link ${currentPage === 'bookmarks' ? 'active' : ''}`} onClick={closeDrawer}>
            <i className="fas fa-bookmark"></i>
            <span>Bookmarks</span>
          </Link>
          <Link href="/sponsor-us" className={`drawer-link ${currentPage === 'sponsor-us' ? 'active' : ''}`} onClick={closeDrawer}>
            <i className="fas fa-star"></i>
            <span>Sponsors</span>
          </Link>
          <Link href="/newsletter" className={`drawer-link ${currentPage === 'newsletter' ? 'active' : ''}`} onClick={closeDrawer}>
            <i className="fas fa-envelope"></i>
            <span>Newsletter</span>
          </Link>
          <Link href="/rss-info" className={`drawer-link ${currentPage === 'rss-info' ? 'active' : ''}`} onClick={closeDrawer}>
            <i className="fas fa-rss"></i>
            <span>RSS</span>
          </Link>
        </nav>
        <div className="drawer-footer">
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
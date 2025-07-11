'use client';

import Link from 'next/link';
import NewsletterForm from '../components/NewsletterForm';
import styles from '../page.module.css';
import '../globals.css';

export default function NewsletterPage() {
  return (
    <>
      <header className="header">
        <nav className="nav">
          <div className="nav-brand">
            <Link href="/" className="brand-link">
              <i className="fab fa-github brand-icon"></i>
              <span className="brand-text">Open-source Projects</span>
            </Link>
          </div>
          <div className="nav-links">
            <Link href="/" className="nav-link">
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>
            <Link href="/newsletter" className="nav-link">
              <i className="fas fa-envelope"></i>
              <span>Newsletter</span>
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
      <div className={styles.page}>
        <main className={styles.main}>
          <div style={{ textAlign: 'center' }}>
            <h1 className="hero-title">
              <span className="gradient-text">Stay Updated</span>
            </h1>
            <p className="hero-description">
              Subscribe to our newsletter to get the latest updates on new projects and hidden gems.
            </p>
          </div>
          <NewsletterForm />
        </main>
      </div>
    </>
  );
}

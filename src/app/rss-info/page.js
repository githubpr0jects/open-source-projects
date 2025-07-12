'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RSSInfoPage() {
  const [copiedUrl, setCopiedUrl] = useState('');

  const copyToClipboard = async (url, type) => {
    try {
      const fullUrl = window.location.origin + url;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(type);
      
      // Add visual feedback animation
      const button = document.querySelector(`[data-copy-type="${type}"]`);
      if (button) {
        button.classList.add('copying');
        setTimeout(() => button.classList.remove('copying'), 600);
      }
      
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <>
      <Header currentPage="rss-info" />
      <div className="rss-info-container">
      <div className="rss-info-content">
        <header className="rss-info-header">
          <h1>📡 RSS Feed Information</h1>
          <p className="rss-info-subtitle">
            Subscribe to our RSS feeds to stay updated with the latest open-source project discoveries
          </p>
        </header>

        <div className="rss-feeds-grid">
          <div className="rss-feed-card">
            <div className="feed-icon">
              <i className="fas fa-rss"></i>
            </div>
            <h3>RSS 2.0 Feed</h3>
            <p>Standard RSS format compatible with most RSS readers</p>
            <div className="feed-actions">
              <a 
                href="/rss" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <i className="fas fa-external-link-alt"></i>
                View RSS Feed
              </a>
              <button 
                onClick={() => copyToClipboard('/rss', 'rss')}
                className={`btn ${copiedUrl === 'rss' ? 'btn-success' : 'btn-outline'}`}
                title="Copy RSS URL"
                data-copy-type="rss"
              >
                <i className={`fas ${copiedUrl === 'rss' ? 'fa-check' : 'fa-copy'}`}></i>
                {copiedUrl === 'rss' ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
            <div className="feed-url">
              <code>{typeof window !== 'undefined' ? window.location.origin : 'https://opensourceprojects.dev'}/rss</code>
            </div>
          </div>

          <div className="rss-feed-card">
            <div className="feed-icon atom">
              <i className="fas fa-atom"></i>
            </div>
            <h3>Atom Feed</h3>
            <p>Modern Atom 1.0 format with enhanced metadata</p>
            <div className="feed-actions">
              <a 
                href="/feed.xml" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <i className="fas fa-external-link-alt"></i>
                View Atom Feed
              </a>
              <button 
                onClick={() => copyToClipboard('/feed.xml', 'atom')}
                className={`btn ${copiedUrl === 'atom' ? 'btn-success' : 'btn-outline'}`}
                title="Copy Atom URL"
                data-copy-type="atom"
              >
                <i className={`fas ${copiedUrl === 'atom' ? 'fa-check' : 'fa-copy'}`}></i>
                {copiedUrl === 'atom' ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
            <div className="feed-url">
              <code>{typeof window !== 'undefined' ? window.location.origin : 'https://opensourceprojects.dev'}/feed.xml</code>
            </div>
          </div>
        </div>

        <div className="rss-info-section">
          <h2>🔧 How to Subscribe</h2>
          <div className="subscription-methods">
            <div className="method-card">
              <h4>📱 RSS Readers</h4>
              <p>Copy any feed URL above and add it to your favorite RSS reader:</p>
              <ul>
                <li>Feedly</li>
                <li>Inoreader</li>
                <li>NewsBlur</li>
                <li>RSS Guard</li>
                <li>Apple News (iOS/macOS)</li>
              </ul>
            </div>
            <div className="method-card">
              <h4>🌐 Browser Extensions</h4>
              <p>Many browsers can auto-detect our RSS feeds:</p>
              <ul>
                <li>RSS Button for Chrome</li>
                <li>Feedbro</li>
                <li>RSS Feed Reader</li>
                <li>Want My RSS</li>
              </ul>
            </div>
            <div className="method-card">
              <h4>🔗 Direct Links</h4>
              <p>Bookmark or share the feed URLs directly:</p>
              <ul>
                <li>RSS: /rss</li>
                <li>Atom: /feed.xml</li>
                <li>Both feeds auto-update every 5 minutes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rss-info-section">
          <h2>📊 Feed Information</h2>
          <div className="feed-stats">
            <div className="stat-item">
              <strong>Update Frequency:</strong>
              <span>Every 5 minutes</span>
            </div>
            <div className="stat-item">
              <strong>Content Source:</strong>
              <span>Latest GitHub projects and discoveries</span>
            </div>
            <div className="stat-item">
              <strong>Format Support:</strong>
              <span>RSS 2.0 and Atom 1.0</span>
            </div>
            <div className="stat-item">
              <strong>Auto-Discovery:</strong>
              <span>Enabled (RSS readers can auto-detect)</span>
            </div>
          </div>
        </div>

        <div className="rss-info-section">
          <h2>❓ Troubleshooting</h2>
          <div className="troubleshooting">
            <details className="faq-item">
              <summary>Feed not updating in my RSS reader?</summary>
              <p>RSS readers cache feeds for different periods. Try manually refreshing or check your reader&apos;s update settings. Our feeds update every 5 minutes.</p>
            </details>
            <details className="faq-item">
              <summary>Getting an error when adding the feed?</summary>
              <p>Make sure you&apos;re using the complete URL including the domain. Some readers require the full https:// prefix.</p>
            </details>
            <details className="faq-item">
              <summary>Prefer email updates instead?</summary>
              <p>Check out our <Link href="/newsletter">newsletter subscription</Link> for weekly email summaries of the best projects.</p>
            </details>
          </div>
        </div>

        <div className="rss-info-footer">
          <Link href="/" className="btn btn-outline">
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </Link>
          <Link href="/newsletter" className="btn btn-primary">
            <i className="fas fa-envelope"></i>
            Try Our Newsletter
          </Link>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

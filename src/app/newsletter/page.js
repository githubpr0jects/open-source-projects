'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import NewsletterForm from '../components/NewsletterForm';
import styles from '../page.module.css'; // Reusing global styles

export default function NewsletterPage() {
  return (
    <>
      <div className="grain-overlay"></div>
      <Header currentPage="newsletter" />
      <main className="main newsletter-main">
        <div className="container">
          <section className="newsletter-section">
            <div className="section-header">
              <h1 className="section-title">Join Our Newsletter</h1>
              <p className="section-description">
                Stay updated with the latest open-source projects, news, and insights.
              </p>
            </div>
            <div className="newsletter-container">
              <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <NewsletterForm />
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

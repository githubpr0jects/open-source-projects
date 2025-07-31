'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

// Move metadata to a separate component or handle differently
function SponsorUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    bidding_amount: '',
    description: '',
    source: 'sponsor-page'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('https://lb2-twitter-api.opensourceprojects.dev/sponsor-enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          bidding_amount: parseFloat(formData.bidding_amount) || 0
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          website: '',
          bidding_amount: '',
          description: '',
          source: 'sponsor-page'
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Header currentPage="sponsor-us" />
      
      <main className="sponsor-page">
        {/* Hero Section */}
        <section className="sponsor-hero">
          <div className="sponsor-hero-content">
            <div className="sponsor-hero-text">
              <h1 className="sponsor-hero-title">
                Showcase Your Project to 
                <span className="gradient-text"> Thousands of Developers</span>
              </h1>
              <p className="sponsor-hero-subtitle">
                Get premium visibility for your open-source project and reach the right audience. 
                Our platform connects amazing projects with passionate developers.
              </p>
              
              <div className="sponsor-stats">
                <div className="sponsor-stat">
                  <div className="stat-number">1M+</div>
                  <div className="stat-label">Monthly Visitors</div>
                </div>
                <div className="sponsor-stat">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Featured Projects</div>
                </div>
                <div className="sponsor-stat">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Developer Audience</div>
                </div>
              </div>
            </div>
            
            <div className="sponsor-hero-image">
              <Image
                src="/images/sponsor.jpg"
                alt="Sponsor Your Open Source Project"
                width={600}
                height={400}
                className="hero-image"
                priority
              />
            </div>
          </div>
        </section>

        {/* Current Sponsors Section */}
        <section className="current-sponsors">
          <div className="section-header">
            <h2>Current Sponsors</h2>
            <p>Thank you to our amazing sponsors who help keep this platform running</p>
          </div>
          
          <div className="sponsors-list">
            <div className="sponsor-item">
              <span className="sponsor-badge">
                <i className="fas fa-star"></i>
                Featured
              </span>
              <a 
                href="https://track.opensourceprojects.dev/droidrun-sponsor" 
                target="_blank" 
                rel="noopener noreferrer"
                className="sponsor-name"
              >
                DroidRun
              </a>
            </div>
          </div>
          
          <div className="sponsors-cta">
            <p>Want to be featured here?</p>
            <button 
              className="cta-button"
              onClick={() => {
                document.querySelector('.sponsor-packages').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Sponsorship Packages
            </button>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="sponsor-benefits">
          <div className="section-header">
            <h2>Why Sponsor With Us?</h2>
            <p>Maximize your project&apos;s reach and impact in the developer community</p>
          </div>
          
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h3>Premium Visibility</h3>
              <p>Your project gets featured in the top 3 positions on our homepage, ensuring maximum exposure to our audience.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Developer Audience</h3>
              <p>Reach thousands of active developers, contributors, and open-source enthusiasts looking for interesting projects.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Boost Engagement</h3>
              <p>Increase GitHub stars, contributors, and community engagement for your project with targeted exposure.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h3>Launch Support</h3>
              <p>Perfect for new project launches or major version releases that need community attention and adoption.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Community Driven</h3>
              <p>Join a community that values quality open-source projects and supports innovative development.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-analytics"></i>
              </div>
              <h3>Performance Tracking</h3>
              <p>Get detailed analytics on views, clicks, and engagement metrics for your sponsored placement.</p>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="sponsor-packages">
          <div className="section-header">
            <h2>Sponsorship Packages</h2>
            <p>Choose the perfect package for your project&apos;s needs</p>
          </div>
          
          <div className="packages-grid">
            <div className="package-card">
              <div className="package-header">
                <h3>Featured Spot</h3>
                <div className="package-price">
                  <span className="price">$99</span>
                  <span className="period">/week</span>
                </div>
              </div>
              <ul className="package-features">
                <li><i className="fas fa-check"></i> Premium homepage placement</li>
                <li><i className="fas fa-check"></i> 7 days visibility</li>
                <li><i className="fas fa-check"></i> Custom project description</li>
                <li><i className="fas fa-check"></i> Click tracking</li>
                {/* <li><i className="fas fa-check"></i> Social media mention</li> */}
              </ul>
              <button 
                className="package-cta"
                onClick={() => {
                  setFormData(prev => ({ ...prev, bidding_amount: '99' }));
                  document.querySelector('.sponsor-form-container').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Choose Featured
              </button>
            </div>
            
            <div className="package-card popular">
              <div className="package-badge">Most Popular</div>
              <div className="package-header">
                <h3>Premium Boost</h3>
                <div className="package-price">
                  <span className="price">$249</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="package-features">
                <li><i className="fas fa-check"></i> Everything in Featured</li>
                <li><i className="fas fa-check"></i> 30 days visibility</li>
                <li><i className="fas fa-check"></i> Newsletter inclusion</li>
                <li><i className="fas fa-check"></i> Detailed analytics</li>
                <li><i className="fas fa-check"></i> Priority support</li>
                <li><i className="fas fa-check"></i> Custom banner design</li>
              </ul>
              <button 
                className="package-cta primary"
                onClick={() => {
                  setFormData(prev => ({ ...prev, bidding_amount: '249' }));
                  document.querySelector('.sponsor-form-container').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Choose Premium
              </button>
            </div>
            
            <div className="package-card">
              <div className="package-header">
                <h3>Enterprise</h3>
                <div className="package-price">
                  <span className="price">Custom</span>
                  <span className="period">pricing</span>
                </div>
              </div>
              <ul className="package-features">
                <li><i className="fas fa-check"></i> Everything in Premium</li>
                <li><i className="fas fa-check"></i> Extended placement</li>
                <li><i className="fas fa-check"></i> Custom integration</li>
                <li><i className="fas fa-check"></i> Dedicated support</li>
                <li><i className="fas fa-check"></i> Multiple projects</li>
                <li><i className="fas fa-check"></i> Brand partnership</li>
              </ul>
              <button 
                className="package-cta"
                onClick={() => {
                  setFormData(prev => ({ ...prev, bidding_amount: '500' }));
                  document.querySelector('.sponsor-form-container').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="sponsor-contact">
          <div className="contact-content">
            <h2>Ready to Showcase Your Project?</h2>
            <p>Fill out the form below to get started with your sponsorship enquiry. We&apos;ll get back to you within 24 hours.</p>
            
            {/* Sponsor Enquiry Form */}
            <div className="sponsor-form-container">
              <form onSubmit={handleSubmit} className="sponsor-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Your full name"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your@email.com"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="website">Project Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourproject.com"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="bidding_amount">Budget (USD) *</label>
                    <input
                      type="number"
                      id="bidding_amount"
                      name="bidding_amount"
                      value={formData.bidding_amount}
                      onChange={handleInputChange}
                      required
                      min="99"
                      placeholder="299"
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="description">Project Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    placeholder="Tell us about your project, what makes it special, and why you'd like to sponsor this spot..."
                    className="form-textarea"
                  />
                </div>
                
                {submitStatus === 'success' && (
                  <div className="form-message success">
                    <i className="fas fa-check-circle"></i>
                    Thank you! Your sponsorship enquiry has been submitted. We&apos;ll contact you within 24 hours.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="form-message error">
                    <i className="fas fa-exclamation-circle"></i>
                    Sorry, there was an error submitting your enquiry. Please try again or contact us directly.
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="form-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Submit Enquiry
                    </>
                  )}
                </button>
              </form>
            </div>
            
            <div className="contact-divider">
              <span>OR</span>
            </div>
            
            <div className="contact-methods">
              <a href="mailto:sponsors@opensourceprojects.dev" className="contact-method">
                <i className="fas fa-envelope"></i>
                <div>
                  <strong>Email Us</strong>
                  <span>sponsors@opensourceprojects.dev</span>
                </div>
              </a>
              
              <a href="#" className="contact-method">
                <i className="fab fa-twitter"></i>
                <div>
                  <strong>Twitter DM</strong>
                  <span>@githubprojects</span>
                </div>
              </a>
              
              {/* <a href="#" className="contact-method">
                <i className="fab fa-discord"></i>
                <div>
                  <strong>Discord</strong>
                  <span>Join our community</span>
                </div>
              </a> */}
            </div>
            
            <div className="contact-cta">
              <Link href="/" className="back-home">
                <i className="fas fa-arrow-left"></i>
                Back to Projects
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}

export default SponsorUs;

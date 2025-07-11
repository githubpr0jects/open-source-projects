import React, { useState } from 'react';
import styles from '../page.module.css';

/**
 * NewsletterForm Component
 * A reusable newsletter subscription form.
 * Props:
 * - onSubmit: function(email) => void | Promise<void>
 * - placeholder: string (optional)
 * - buttonText: string (optional)
 * - successMessage: string (optional)
 * - errorMessage: string (optional)
 */
export default function NewsletterForm({
  onSubmit,
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  successMessage = 'Thank you for subscribing!',
  errorMessage = 'Please enter a valid email address.'
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError(errorMessage);
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Subscription failed.');
      }

      setStatus('success');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Subscription failed.');
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles['newsletter-form']}>
      <h3 className={styles['newsletter-title']}>Subscribe to our Newsletter</h3>
      <p className={styles['newsletter-description']}>
        Get the latest updates on new projects and hidden gems, delivered straight to your inbox.
      </p>
      <div className={styles['newsletter-input-wrapper']}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          disabled={status === 'loading' || status === 'success'}
          className={styles['newsletter-input']}
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={styles['newsletter-button']}
        >
          {status === 'loading' ? 'Submitting...' : buttonText}
        </button>
      </div>
      {status === 'success' && (
        <div className={`${styles['newsletter-message']} ${styles.success}`}>{successMessage}</div>
      )}
      {status === 'error' && error && (
        <div className={`${styles['newsletter-message']} ${styles.error}`}>{error}</div>
      )}
    </form>
  );
}

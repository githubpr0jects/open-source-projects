import { useState } from 'react';
import styles from './NewsletterForm.module.css';
import { trackNewsletterSubscription } from '../utils/analytics';

export default function NewsletterForm({ 
  source = 'unknown', 
  postId = null, 
  postTitle = null 
}) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        
        // Track successful newsletter subscription in Google Analytics
        trackNewsletterSubscription(source, email, postId, postTitle);
        
        setEmail(''); // Clear input on success
      } else {
        setMessage(data.message || 'Something went wrong.');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Failed to connect to the server.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.newsletterForm}>
      <h4>Join our weekly newsletter</h4>
      <p>Subscribe to our newsletter to get the latest updates on open-source projects.</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email address"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {message && (
        <p className={`${styles.message} ${isSuccess ? styles.success : styles.error}`}>
          {message}
        </p>
      )}
    </div>
  );
}
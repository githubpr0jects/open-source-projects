'use client';

import Link from 'next/link';

export default function Error({ error, reset }) {
  return (
    <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        An unexpected error occurred. Please try again.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={reset}
          className="btn btn-primary"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          className="btn btn-outline"
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'var(--text-primary)',
            fontSize: '1rem',
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
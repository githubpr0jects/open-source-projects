import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found | Open-source Projects',
  description: 'The page you are looking for could not be found.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-description">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="not-found-link">
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
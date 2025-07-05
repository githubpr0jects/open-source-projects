'use client';

import { useState, useEffect } from 'react';

const TwitterMetrics = ({ postId, tweetUrl }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!tweetUrl) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use the backend API to fetch Twitter metrics
        const response = await fetch('/api/tweet-metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: tweetUrl }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.status}`);
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.warn('Failed to fetch Twitter metrics:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [tweetUrl]);

  // Don't render anything if there's no tweet URL
  if (!tweetUrl) {
    return null;
  }

  if (loading) {
    return (
      <div className="twitter-metrics-container">
        <div className="twitter-metrics-header">
          <i className="fab fa-twitter"></i>
          <span>X Engagement</span>
        </div>
        <div className="twitter-metrics-loading">
          <div className="loading-spinner-small"></div>
          <span>Loading metrics...</span>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="twitter-metrics-container">
        <div className="twitter-metrics-header">
          <i className="fab fa-twitter"></i>
          <span>X Engagement</span>
        </div>
        <div className="twitter-metrics-error">
          <i className="fas fa-exclamation-circle"></i>
          <span>Metrics unavailable</span>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <>
      <div className="twitter-metrics-container">
        <div className="twitter-metrics-header">
          <i className="fab fa-twitter"></i>
          <span>X Engagement</span>
          <a 
            href={tweetUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="twitter-link"
            title="View on X"
          >
            <i className="fas fa-external-link-alt"></i>
          </a>
        </div>
        
        <div className="twitter-metrics-stats">
          <div className="metric-item">
            <div className="metric-icon likes">
              <i className="fas fa-heart"></i>
            </div>
            <div className="metric-details">
              <span className="metric-value">{formatNumber(metrics.likes)}</span>
              <span className="metric-label">Likes</span>
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-icon retweets">
              <i className="fas fa-retweet"></i>
            </div>
            <div className="metric-details">
              <span className="metric-value">{formatNumber(metrics.retweets)}</span>
              <span className="metric-label">Retweets</span>
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-icon shares">
              <i className="fas fa-quote-left"></i>
            </div>
            <div className="metric-details">
              <span className="metric-value">{formatNumber(metrics.shares)}</span>
              <span className="metric-label">Quotes</span>
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-icon views">
              <i className="fas fa-eye"></i>
            </div>
            <div className="metric-details">
              <span className="metric-value">{formatNumber(metrics.views)}</span>
              <span className="metric-label">Views</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .twitter-metrics-container {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .twitter-metrics-container:hover {
          border-color: #1da1f2;
          box-shadow: 0 4px 20px rgba(29, 161, 242, 0.1);
          transform: translateY(-2px);
        }

        .twitter-metrics-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: #1da1f2;
          font-weight: 600;
          font-size: 16px;
        }

        .twitter-metrics-header i.fab {
          font-size: 20px;
        }

        .twitter-link {
          margin-left: auto;
          color: #666;
          text-decoration: none;
          transition: color 0.2s ease;
          padding: 4px;
        }

        .twitter-link:hover {
          color: #1da1f2;
        }

        .twitter-link i {
          font-size: 14px;
        }

        .twitter-metrics-loading,
        .twitter-metrics-error {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 0;
          color: #666;
          font-size: 14px;
        }

        .twitter-metrics-error {
          color: #dc3545;
        }

        .twitter-metrics-error i {
          color: #dc3545;
        }

        .twitter-metrics-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .metric-item:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .metric-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: white;
          flex-shrink: 0;
        }

        .metric-icon.likes {
          background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
        }

        .metric-icon.retweets {
          background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
        }

        .metric-icon.shares {
          background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        }

        .metric-icon.views {
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
        }

        .metric-details {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .metric-value {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .metric-label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid #e1e5e9;
          border-top: 2px solid #1da1f2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media screen and (max-width: 768px) {
          .twitter-metrics-container {
            padding: 16px;
            margin: 20px 0;
          }

          .twitter-metrics-header {
            font-size: 15px;
            margin-bottom: 12px;
          }

          .twitter-metrics-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .metric-item {
            padding: 10px 8px;
            gap: 10px;
          }

          .metric-icon {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }

          .metric-value {
            font-size: 16px;
          }

          .metric-label {
            font-size: 11px;
          }
        }

        @media screen and (max-width: 480px) {
          .twitter-metrics-container {
            padding: 14px;
            margin: 16px 0;
          }

          .twitter-metrics-stats {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .metric-item {
            padding: 12px 10px;
          }

          .metric-details {
            flex: 1;
          }

          .metric-value {
            font-size: 18px;
          }

          .metric-label {
            font-size: 12px;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .twitter-metrics-container {
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
            border-color: #4a5568;
          }

          .twitter-metrics-container:hover {
            border-color: #1da1f2;
            box-shadow: 0 4px 20px rgba(29, 161, 242, 0.2);
          }

          .twitter-metrics-header {
            color: #1da1f2;
          }

          .metric-item {
            background: rgba(255, 255, 255, 0.05);
          }

          .metric-item:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .metric-value {
            color: #f7fafc;
          }

          .metric-label {
            color: #cbd5e0;
          }

          .twitter-metrics-loading,
          .twitter-metrics-error {
            color: #cbd5e0;
          }

          .twitter-link {
            color: #cbd5e0;
          }

          .twitter-link:hover {
            color: #1da1f2;
          }
        }
      `}</style>
    </>
  );
};

export default TwitterMetrics;
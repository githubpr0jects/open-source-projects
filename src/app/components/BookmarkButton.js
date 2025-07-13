'use client';

import { useBookmarks } from '../hooks/useBookmarks';
import { trackBookmark } from '../utils/analytics';

export default function BookmarkButton({ post, className = '', size = 'normal' }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasAdded = toggleBookmark(post);
    
    // Track bookmark event in Google Analytics
    const action = wasAdded ? 'bookmark_added' : 'bookmark_removed';
    const postTitle = post.content ? post.content.split('\n')[0].slice(0, 100) : 'Unknown Project';
    const postUrl = post.github_repo || `https://opensourceprojects.dev/post/${post.conversation_id}`;
    
    trackBookmark(action, post.id || post.conversation_id, postTitle, postUrl);
    
    // Optional: Show a brief notification
    if (typeof window !== 'undefined') {
      const message = wasAdded ? 'Project bookmarked!' : 'Bookmark removed';
      // You could integrate with a toast notification system here
      console.log(message);
    }
  };

  const sizeClasses = {
    small: 'bookmark-btn-small',
    normal: 'bookmark-btn-normal',
    large: 'bookmark-btn-large'
  };

  return (
    <>
      <button 
        onClick={handleClick}
        className={`bookmark-btn ${sizeClasses[size]} ${isBookmarked(post.id) ? 'bookmarked' : ''} ${className}`}
        title={isBookmarked(post.id) ? 'Remove bookmark' : 'Bookmark this project'}
      >
        <i className={isBookmarked(post.id) ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
      </button>

      <style jsx>{`
        .bookmark-btn {
          background: rgba(0, 0, 0, 0.7);
          border: none;
          color: #8b949e;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .bookmark-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          color: #f0f6fc;
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        }

        .bookmark-btn.bookmarked {
          color: #ffd700;
          background: rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.3);
        }

        .bookmark-btn.bookmarked:hover {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
          border-color: rgba(255, 107, 107, 0.3);
        }

        .bookmark-btn-small {
          padding: 0.4rem;
          font-size: 0.8rem;
        }

        .bookmark-btn-normal {
          padding: 0.5rem;
          font-size: 1rem;
        }

        .bookmark-btn-large {
          padding: 0.7rem;
          font-size: 1.2rem;
        }

        .bookmark-btn i {
          transition: all 0.3s ease;
        }

        .bookmark-btn:hover i {
          transform: scale(1.1);
        }
      `}</style>
    </>
  );
}

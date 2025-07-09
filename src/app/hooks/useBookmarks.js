import { useState, useEffect } from 'react';

export const useBookmarks = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);

  useEffect(() => {
    // Load bookmarks from localStorage on mount
    const loadBookmarks = () => {
      try {
        const savedBookmarks = localStorage.getItem('bookmarkedPosts');
        if (savedBookmarks) {
          setBookmarkedPosts(JSON.parse(savedBookmarks));
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };

    loadBookmarks();
  }, []);

  const isBookmarked = (postId) => {
    return bookmarkedPosts.some(post => post.id === postId);
  };

  const addBookmark = (post) => {
    if (!isBookmarked(post.id)) {
      const updatedBookmarks = [...bookmarkedPosts, post];
      setBookmarkedPosts(updatedBookmarks);
      localStorage.setItem('bookmarkedPosts', JSON.stringify(updatedBookmarks));
      return true;
    }
    return false;
  };

  const removeBookmark = (postId) => {
    const updatedBookmarks = bookmarkedPosts.filter(post => post.id !== postId);
    setBookmarkedPosts(updatedBookmarks);
    localStorage.setItem('bookmarkedPosts', JSON.stringify(updatedBookmarks));
    return true;
  };

  const toggleBookmark = (post) => {
    if (isBookmarked(post.id)) {
      removeBookmark(post.id);
      return false; // removed
    } else {
      addBookmark(post);
      return true; // added
    }
  };

  const clearAllBookmarks = () => {
    setBookmarkedPosts([]);
    localStorage.removeItem('bookmarkedPosts');
  };

  return {
    bookmarkedPosts,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    clearAllBookmarks,
    bookmarkCount: bookmarkedPosts.length
  };
};

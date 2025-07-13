// Google Analytics tracking utilities

export const GA_TRACKING_ID = 'G-PM4NQK4MYG';

// Track custom events
export const trackEvent = (action, category, label = '', value = 0, additional_parameters = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...additional_parameters
    });
  }
};

// Specific tracking functions for common events

// Track bookmark events
export const trackBookmark = (action, postId, postTitle, postUrl) => {
  trackEvent(action, 'Bookmark', postTitle, 1, {
    post_id: postId,
    post_url: postUrl,
    custom_parameter_1: 'project_bookmark'
  });
};

// Track newsletter subscription events
export const trackNewsletterSubscription = (source, email, postId = null, postTitle = null) => {
  const eventData = {
    subscription_source: source,
    user_email_domain: email ? email.split('@')[1] : 'unknown'
  };

  // Add post-specific data if provided
  if (postId && postTitle) {
    eventData.post_id = postId;
    eventData.post_title = postTitle;
  }

  trackEvent('newsletter_signup', 'Newsletter', source, 1, eventData);
};

// Track page views with custom parameters
export const trackPageView = (url, title, postId = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const eventData = {
      page_title: title,
      page_location: url
    };

    if (postId) {
      eventData.post_id = postId;
    }

    window.gtag('config', GA_TRACKING_ID, {
      page_title: title,
      page_location: url,
      custom_map: {
        custom_parameter_1: 'post_id'
      }
    });
  }
};

// Track search events
export const trackSearch = (searchTerm, resultCount, sortOrder) => {
  trackEvent('search', 'Site Search', searchTerm, resultCount, {
    search_term: searchTerm,
    result_count: resultCount,
    sort_order: sortOrder
  });
};

// Track filter usage
export const trackFilter = (filterType, filterValue) => {
  trackEvent('filter_used', 'Site Filter', `${filterType}: ${filterValue}`, 1, {
    filter_type: filterType,
    filter_value: filterValue
  });
};

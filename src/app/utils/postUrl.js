// One public URL per post, used for links, the sitemap and the canonical tag.
// X-era posts (numeric tweet ids) keep the id URL their 2025 backlinks point to.
// Newer posts use their short code: every shared link (X, newsletters, osp.fyi)
// points there, and it's the URL Google picks as canonical.
export const postSlug = (post) => {
  const id = String(post?.conversation_id || post?.id || '');
  if (/^\d+$/.test(id)) return id;
  return post?.short_code || id;
};

export const postPath = (post) => `/post/${postSlug(post)}`;

// Sponsor tracking links open with rel="noreferrer", so the backend can't read
// the Referer. Tag each link with where the card was shown instead
// ('home' or the post id) for the sponsor analytics report.
export const sponsorLinkFrom = (link, from) => {
  if (!link || !from) return link;
  return `${link}${link.includes('?') ? '&' : '?'}from=${encodeURIComponent(from)}`;
};

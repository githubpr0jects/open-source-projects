export default function manifest() {
  return {
    name: 'Open-source Projects',
    short_name: 'OSS Projects',
    description: 'Discover and explore the best open-source projects from GitHub. Find hidden gems, trending repositories, and amazing developer tools.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f23',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
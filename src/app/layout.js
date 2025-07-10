import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: {
    default: 'Open-source Projects | Discover the Best Open Source Projects',
    template: '%s | Open-source Projects'
  },
  description: 'Discover and explore the best open-source projects from GitHub. Find hidden gems, trending repositories, and amazing developer tools in our curated collection.',
  keywords: [
    'open source',
    'github',
    'programming',
    'development',
    'software',
    'projects',
    'repositories',
    'code',
    'developers',
    'tools',
    'libraries',
    'frameworks'
  ],
  authors: [{ name: 'Open-source Projects Team' }],
  creator: 'Open-source Projects',
  publisher: 'Open-source Projects',
  
  // Open Graph metadata
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://opensourceprojects.dev',
    siteName: 'Open-source Projects',
    title: 'Open-source Projects | Discover the Best Open Source Projects',
    description: 'Discover and explore the best open-source projects from GitHub. Find hidden gems, trending repositories, and amazing developer tools in our curated collection.',
    images: [
      {
        url: 'https://opensourceprojects.dev/images/open-source-logo-830x460.jpg',
        width: 1200,
        height: 630,
        alt: 'Open-source Projects - Discover the Best Open Source Projects',
        type: 'image/jpeg',
      },
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Open-source Projects | Discover the Best Open Source Projects',
    description: 'Discover and explore the best open-source projects from GitHub. Find hidden gems, trending repositories, and amazing developer tools.',
    images: ['https://opensourceprojects.dev/images/open-source-logo-830x460.jpg'],
    creator: '@opensourceprojects',
    site: '@opensourceprojects',
  },
  
  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // App metadata
  applicationName: 'Open-source Projects',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  
  // Icons and theme
  icons: {
    icon: [
      { url: '/images/open-source-projects-favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/open-source-projects-favicon.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/open-source-projects-favicon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/images/open-source-projects-favicon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/images/open-source-projects-favicon.png',
  },
  
  // Verification (replace with actual verification codes)
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  
  // Category and classification
  category: 'technology',
  classification: 'Open Source Software Directory',
  
  // Language and locale
  metadataBase: new URL('https://opensourceprojects.dev'),
}

// Viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome - Complete Kit */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/brands.min.css"
          integrity="sha512-8RxmFOVaKQe/xtg6lbscU9DU0IRhURWEuiI0tXevv+lXbAHfkpamD4VKFQRto9WgfOJDwOZ74c/s9Yesv3VvIQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PM4NQK4MYG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PM4NQK4MYG');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}

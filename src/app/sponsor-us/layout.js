export const metadata = {
  title: 'Sponsor Us | Open-source Projects',
  description: 'Showcase your project to thousands of developers. Get premium visibility on our platform and boost your open-source project.',
  keywords: ['sponsor', 'showcase', 'open source', 'visibility', 'promotion', 'developers'],
  openGraph: {
    title: 'Sponsor Us | Open-source Projects',
    description: 'Showcase your project to thousands of developers. Get premium visibility on our platform.',
    images: [
      {
        url: 'https://opensourceprojects.dev/images/sponsor.jpg',
        width: 1200,
        height: 630,
        alt: 'Sponsor Open Source Projects',
      },
    ],
  },
};

export default function SponsorUsLayout({ children }) {
  return children;
}

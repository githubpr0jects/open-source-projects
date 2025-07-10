import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Cookie Policy | Open-source Projects',
  description: 'Cookie policy for Open-source Projects - Learn about the cookies we use and how to manage them.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiePolicyPage() {
  return (
    <>
      <div className="grain-overlay"></div>
      <Header />
      
      <main className="main">
        <div className="container">
          <div className="legal-page">
            <div className="legal-header">
              <h1>Cookie Policy</h1>
              <p className="last-updated">Last updated: July 11, 2025</p>
            </div>

            <div className="legal-content">
              <section>
                <h2>What Are Cookies</h2>
                <p>
                  Cookies are small text files that are placed on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  understanding how you use our site.
                </p>
              </section>

              <section>
                <h2>How We Use Cookies</h2>
                <p>Open-source Projects uses cookies for the following purposes:</p>
                
                <h3>Essential Cookies</h3>
                <ul>
                  <li><strong>Website Functionality:</strong> These cookies are necessary for the website to function properly</li>
                  <li><strong>Local Storage:</strong> Your bookmarked projects are stored locally in your browser</li>
                  <li><strong>Preferences:</strong> Remember your settings and preferences</li>
                </ul>

                <h3>Analytics Cookies</h3>
                <ul>
                  <li><strong>Usage Analytics:</strong> Help us understand how visitors interact with our website</li>
                  <li><strong>Performance Monitoring:</strong> Monitor website performance and identify issues</li>
                  <li><strong>Content Optimization:</strong> Understand which content is most popular</li>
                </ul>

                <h3>Advertising Cookies</h3>
                <ul>
                  <li><strong>Google AdSense:</strong> Used to display relevant advertisements</li>
                  <li><strong>Ad Personalization:</strong> May be used to serve personalized ads based on interests</li>
                  <li><strong>Ad Performance:</strong> Track the effectiveness of advertisements</li>
                </ul>
              </section>

              <section>
                <h2>Third-Party Cookies</h2>
                
                <h3>Google AdSense</h3>
                <p>
                  We use Google AdSense to display advertisements on our website. Google may place 
                  cookies on your device to serve relevant ads and measure ad performance. Google&apos;s 
                  use of advertising cookies enables it and its partners to serve ads based on your 
                  visits to our site and other sites on the internet.
                </p>

                <h3>Analytics Services</h3>
                <p>
                  We may use third-party analytics services that place cookies to help us understand 
                  website usage patterns. These services provide anonymized data about how visitors 
                  interact with our website.
                </p>
              </section>

              <section>
                <h2>Managing Cookies</h2>
                
                <h3>Browser Settings</h3>
                <p>
                  You can control and manage cookies through your browser settings. Most browsers 
                  allow you to:
                </p>
                <ul>
                  <li>View and delete existing cookies</li>
                  <li>Block cookies from specific websites</li>
                  <li>Block all cookies</li>
                  <li>Delete cookies when you close your browser</li>
                </ul>

                <h3>Google Ad Settings</h3>
                <p>
                  You can opt out of personalized advertising by visiting Google&apos;s Ad Settings page. 
                  This will disable personalized ads but you may still see non-personalized ads.
                </p>

                <h3>Impact of Disabling Cookies</h3>
                <p>
                  Please note that disabling cookies may affect the functionality of our website:
                </p>
                <ul>
                  <li>Your bookmarks may not be saved</li>
                  <li>Website preferences may not be remembered</li>
                  <li>Some features may not work properly</li>
                </ul>
              </section>

              <section>
                <h2>Cookie Retention</h2>
                <ul>
                  <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted</li>
                  <li><strong>Local Storage:</strong> Bookmarks are stored until you clear browser data or manually remove them</li>
                </ul>
              </section>

              <section>
                <h2>Updates to Cookie Policy</h2>
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our 
                  practices or applicable laws. Any changes will be posted on this page with an 
                  updated &quot;Last updated&quot; date.
                </p>
              </section>

              <section>
                <h2>Contact Us</h2>
                <p>
                  If you have any questions about our use of cookies, please contact us through 
                  our social media channels linked in the footer.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

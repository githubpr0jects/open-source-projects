import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Privacy Policy | Open-source Projects',
  description: 'Privacy policy for Open-source Projects - Learn how we protect your privacy and handle data.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="grain-overlay"></div>
      <Header />
      
      <main className="main">
        <div className="container">
          <div className="legal-page">
            <div className="legal-header">
              <h1>Privacy Policy</h1>
              <p className="last-updated">Last updated: July 11, 2025</p>
            </div>

            <div className="legal-content">
              <section>
                <h2>Overview</h2>
                <p>
                  Open-source Projects (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, and safeguard information when you 
                  visit our website opensourceprojects.dev (the &quot;Service&quot;).
                </p>
              </section>

              <section>
                <h2>Information We Collect</h2>
                
                <h3>Information We DO NOT Collect</h3>
                <ul>
                  <li>We do not collect personal information such as names, email addresses, or phone numbers</li>
                  <li>We do not require user registration or account creation</li>
                  <li>We do not store personal data in databases</li>
                  <li>We do not track users across other websites</li>
                </ul>

                <h3>Information We May Collect</h3>
                <ul>
                  <li><strong>Browser Information:</strong> Browser type, version, and operating system</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent on pages, and referral sources</li>
                  <li><strong>Local Storage:</strong> Bookmarked projects are stored locally in your browser only</li>
                  <li><strong>Cookies:</strong> Essential cookies for website functionality and analytics</li>
                </ul>
              </section>

              <section>
                <h2>How We Use Information</h2>
                <p>Any information collected is used solely to:</p>
                <ul>
                  <li>Improve website performance and user experience</li>
                  <li>Analyze website usage patterns and popular content</li>
                  <li>Ensure website security and prevent abuse</li>
                  <li>Display relevant advertisements through Google AdSense</li>
                </ul>
              </section>

              <section>
                <h2>Local Storage and Bookmarks</h2>
                <p>
                  Our bookmark feature stores your saved projects locally in your browser&apos;s storage. 
                  This data never leaves your device and is not transmitted to our servers. You can 
                  clear this data at any time through your browser settings.
                </p>
              </section>

              <section>
                <h2>Third-Party Services</h2>
                
                <h3>Google AdSense</h3>
                <p>
                  We use Google AdSense to display advertisements. Google may use cookies and similar 
                  technologies to serve ads based on your interests. You can opt out of personalized 
                  advertising by visiting Google&apos;s Ad Settings.
                </p>

                <h3>Analytics</h3>
                <p>
                  We may use analytics services to understand how visitors use our website. This helps 
                  us improve our content and user experience. These services may use cookies and collect 
                  anonymized usage data.
                </p>
              </section>

              <section>
                <h2>Data Security</h2>
                <p>
                  We implement appropriate security measures to protect against unauthorized access, 
                  alteration, disclosure, or destruction of information. However, no method of 
                  transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2>Children&apos;s Privacy</h2>
                <p>
                  Our Service is not directed to children under 13. We do not knowingly collect 
                  personal information from children under 13. If we become aware that we have 
                  collected such information, we will take steps to delete it immediately.
                </p>
              </section>

              <section>
                <h2>Changes to Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. Changes will be posted on this 
                  page with an updated &quot;Last updated&quot; date. Continued use of the Service after changes 
                  constitutes acceptance of the new Privacy Policy.
                </p>
              </section>

              <section>
                <h2>Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us through our 
                  social media channels linked in the footer.
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

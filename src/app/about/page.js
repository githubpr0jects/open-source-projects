import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'About Us | Open-source Projects',
  description: 'Learn about Open-source Projects - Discovering and showcasing the best open-source projects and hidden gems.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <>
      <div className="grain-overlay"></div>
      <Header />
      
      <main className="main">
        <div className="container">
          <div className="legal-page">
            <div className="legal-header">
              <h1>About Open-source Projects</h1>
              <p className="last-updated">Discovering and showcasing the best open-source projects</p>
            </div>

            <div className="legal-content">
              <section>
                <h2>Our Mission</h2>
                <p>
                  Open-source Projects is dedicated to discovering, curating, and showcasing the best 
                  open-source projects and hidden gems in the developer community. We believe in the 
                  power of open-source software to drive innovation, foster collaboration, and make 
                  technology accessible to everyone.
                </p>
              </section>

              <section>
                <h2>What We Do</h2>
                <p>
                  Our platform serves as a comprehensive resource for developers, enthusiasts, and 
                  anyone interested in open-source technology. We provide:
                </p>
                <ul>
                  <li><strong>Project Discovery:</strong> Carefully curated selection of innovative open-source projects</li>
                  <li><strong>Detailed Insights:</strong> In-depth analysis and reviews of featured projects</li>
                  <li><strong>Community Focus:</strong> Highlighting projects that make a real difference</li>
                  <li><strong>Easy Access:</strong> Simple, user-friendly interface to explore and bookmark projects</li>
                </ul>
              </section>

              <section>
                <h2>Our Values</h2>
                
                <h3>Open Source First</h3>
                <p>
                  We are passionate advocates for open-source software and the principles of 
                  transparency, collaboration, and community-driven development.
                </p>

                <h3>Quality Over Quantity</h3>
                <p>
                  Rather than overwhelming users with thousands of projects, we focus on 
                  hand-picking high-quality, innovative, and useful open-source solutions.
                </p>

                <h3>Privacy Respected</h3>
                <p>
                  We respect user privacy and do not collect personal information. Our bookmark 
                  feature stores data locally on your device, ensuring your privacy is protected.
                </p>

                <h3>Community Driven</h3>
                <p>
                  We believe in the power of community and aim to support developers and projects 
                  that contribute positively to the open-source ecosystem.
                </p>
              </section>

              <section>
                <h2>How We Select Projects</h2>
                <p>Our curation process focuses on projects that demonstrate:</p>
                <ul>
                  <li>Innovation and creativity in solving real-world problems</li>
                  <li>Active development and community engagement</li>
                  <li>High code quality and documentation standards</li>
                  <li>Practical utility for developers or end-users</li>
                  <li>Potential for significant impact in their respective domains</li>
                </ul>
              </section>

              <section>
                <h2>Features</h2>
                
                <h3>Local Bookmarking</h3>
                <p>
                  Save your favorite projects with our privacy-first bookmark system that stores 
                  data locally in your browser - no accounts required.
                </p>

                <h3>Responsive Design</h3>
                <p>
                  Enjoy a seamless experience across all devices with our mobile-optimized, 
                  responsive design.
                </p>

                <h3>Rich Content</h3>
                <p>
                  Access detailed project information, including descriptions, GitHub integration, 
                  and visual previews.
                </p>
              </section>

              <section>
                <h2>Technology Stack</h2>
                <p>
                  Our platform is built using modern web technologies and is itself an example 
                  of quality open-source development:
                </p>
                <ul>
                  <li><strong>Next.js:</strong> React framework for production-ready web applications</li>
                  <li><strong>React:</strong> Component-based user interface library</li>
                  <li><strong>Modern CSS:</strong> Responsive design with custom styling</li>
                  <li><strong>Open Source:</strong> Built with and for the open-source community</li>
                </ul>
              </section>

              <section>
                <h2>Commitment to Quality</h2>
                <p>
                  We are committed to maintaining high standards in everything we do:
                </p>
                <ul>
                  <li>Regular updates and fresh content</li>
                  <li>Accurate and up-to-date project information</li>
                  <li>Fast, reliable, and accessible user experience</li>
                  <li>Continuous improvement based on community feedback</li>
                </ul>
              </section>

              <section>
                <h2>Join Our Community</h2>
                <p>
                  We welcome feedback, suggestions, and contributions from the community. 
                  Connect with us through our social media channels and help us discover 
                  the next great open-source project.
                </p>
                <p>
                  Whether you&apos;re a seasoned developer, a curious beginner, or someone who 
                  simply appreciates great software, Open-source Projects is here to help 
                  you discover amazing tools and technologies.
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

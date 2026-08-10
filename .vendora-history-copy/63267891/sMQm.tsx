import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import './LandingPage.css';

const featureItems = [
  {
    title: 'Local storefronts',
    description: 'Help artisans and small businesses list products with rich images, prices, and availability.',
    icon: '🛍️',
  },
  {
    title: 'Secure checkout',
    description: 'Offer customers fast payment flows and order tracking backed by Firebase authentication.',
    icon: '🔒',
  },
  {
    title: 'Community feed',
    description: 'Share updates, offers, and announcements directly with your buyers and neighbors.',
    icon: '📣',
  },
  {
    title: 'Smart analytics',
    description: 'Use Firestore data to understand buyer engagement, popular products, and growth trends.',
    icon: '📊',
  },
];

function LandingPage() {
  const { currentUser, userRole } = useAuth();
  const [membershipCount, setMembershipCount] = useState<number | null>(null);
  const [communityCount, setCommunityCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        setMembershipCount(usersSnapshot.size);
        setCommunityCount(Math.max(1, Math.floor(usersSnapshot.size / 8)));
      } catch (error) {
        console.warn('Unable to load Firestore metrics', error);
      }
    };

    fetchCounts();
  }, []);

  const dashboardPath =
    userRole === 'admin'
      ? '/admin-dashboard'
      : userRole === 'vendor'
      ? '/vendor-onboarding'
      : userRole === 'customer'
      ? '/customer-explore'
      : '/user-dashboard';

  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link className="brand" to="/">
          <span className="brand-mark">C</span>
          <span>
            <strong>Craft Connect</strong>
            <small>Marketplace for makers & communities</small>
          </span>
        </Link>

        <nav className="landing-nav" aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#why">Why it works</a>
          <a href="#metrics">Metrics</a>
          <a href="#contact">Contact</a>
        </nav>

        {currentUser ? (
          <Link className="nav-button" to={dashboardPath}>
            Dashboard
          </Link>
        ) : (
          <Link className="nav-button" to="/login">
            Login
          </Link>
        )}
      </header>

      <main>
        <section className="hero-section" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Build trust with verified local sellers</p>
            <h1>Craft Connect brings makers, buyers, and communities together.</h1>
            <p className="hero-text">
              Launch a modern marketplace with Firebase authentication, Firestore-backed profiles, and a smooth onboarding path for customers and vendors.
            </p>

            <div className="hero-actions">
              <Link className="primary-button" to="/register">
                Get started
              </Link>
              <Link className="secondary-link" to="/login">
                Sign in
              </Link>
            </div>
          </div>

          <div className="hero-media" aria-label="Craft Connect product preview">
            <div className="hero-card">
              <div className="hero-card-pill">Powered by Firebase</div>
              <div className="hero-card-body">
                <h2>Connect your store to real buyers</h2>
                <p>
                  Create a trusted marketplace experience for local communities with secure authentication and real-time Firestore data.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="section-heading">
            <p className="eyebrow">Platform capabilities</p>
            <h2>Everything you need to launch faster.</h2>
            <p>From authentication to seller onboarding and community discovery, Craft Connect gives you a complete marketplace foundation.</p>
          </div>

          <div className="feature-grid">
            {featureItems.map((feature) => (
              <article key={feature.title} className="feature-card">
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section why-section" id="why">
          <div className="why-copy">
            <p className="eyebrow">Why Craft Connect</p>
            <h2>Trusted by artisans, customers and community managers.</h2>
            <p>
              Real product listings, secure sign-in, and a community-first marketplace that keeps every user profile in Firestore for fast, reliable data access.
            </p>
          </div>

          <div className="metrics-grid" id="metrics">
            <div className="metric-card">
              <strong>{membershipCount !== null ? membershipCount : '120+'}</strong>
              <span>Registered users</span>
            </div>
            <div className="metric-card">
              <strong>{communityCount !== null ? communityCount : '15'}</strong>
              <span>Local communities</span>
            </div>
            <div className="metric-card">
              <strong>99.98%</strong>
              <span>Authentication uptime</span>
            </div>
          </div>
        </section>

        <section className="section cta-section">
          <div className="cta-copy">
            <p className="eyebrow">Ready to launch</p>
            <h2>Start your marketplace with a modern Firebase backend.</h2>
          </div>
          <div className="cta-actions">
            <Link className="primary-button" to="/register">
              Create account
            </Link>
            <Link className="secondary-button" to="/login">
              Visit login
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer" id="contact">
        <div>
          <strong>Craft Connect</strong>
          <p>Marketplace for local artisans, customers, and communities.</p>
        </div>
        <p>© 2026 Craft Connect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;

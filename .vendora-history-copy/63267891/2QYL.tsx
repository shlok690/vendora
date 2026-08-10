import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LandingPage.css';

const categories = [
  { title: 'Furniture', description: 'Handcrafted home pieces for every room.' },
  { title: 'Clothing', description: 'Curated fashion from local artisans.' },
  { title: 'Handicrafts', description: 'Unique handmade products with story.' },
];

function LandingPage() {
  const { currentUser, userRole } = useAuth();
  const [search, setSearch] = useState('');
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
          <span className="brand-mark">V</span>
          <span>
            <strong>Vendora</strong>
            <small>Marketplace for local vendors</small>
          </span>
        </Link>

        <nav className="landing-nav" aria-label="Primary navigation">
          <a href="#explore">Explore</a>
          <Link className="nav-link" to="/register">
            Start Selling
          </Link>
        </nav>

        <div className="landing-actions">
          {currentUser ? (
            <Link className="button button-solid" to={dashboardPath}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link className="button button-outline" to="/login">
                Login
              </Link>
              <Link className="button button-solid" to="/register">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">Your Business. Your Store. Your Rules.</span>
            <h1>Your Business. Your Store. Your Rules.</h1>
            <p className="hero-text">
              Empower local vendors and artisans to reach customers with a modern marketplace built for selling, discovery, and community.
            </p>

            <div className="hero-search">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for products or shops"
              />
              <button type="button">Search</button>
            </div>

            <div className="hero-actions">
              <Link className="button button-solid" to="/register">
                Get Started
              </Link>
              <Link className="button button-outline" to="/login">
                Login
              </Link>
            </div>
          </div>

          <div className="hero-preview" aria-label="Vendora hero preview">
            <div className="hero-preview-card">
              <div className="preview-header">
                <span className="preview-dot preview-dot-red" />
                <span className="preview-dot preview-dot-yellow" />
                <span className="preview-dot preview-dot-green" />
              </div>
              <div className="preview-content">
                <p className="preview-label">Featured shops</p>
                <h2>Launch your local storefront today.</h2>
                <div className="preview-badges">
                  <span>Security</span>
                  <span>Realtime</span>
                  <span>Payments</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="category-section" id="explore">
          <div className="category-grid">
            {categories.map((category) => (
              <article key={category.title} className="category-card">
                <div className="category-icon">{category.title[0]}</div>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;

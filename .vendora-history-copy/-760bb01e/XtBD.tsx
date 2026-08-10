import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <main className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Society Management Reimagined</p>
          <h1>Make your society smarter, safer, and more connected.</h1>
          <p className="subtitle">
            A modern platform for residents, admins, and management teams to collaborate effortlessly.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Sociara?</h2>
        <div className="feature-grid">
          <article>
            <h3>Easy Communication</h3>
            <p>Share notices, updates, and announcements in one place.</p>
          </article>
          <article>
            <h3>Secure Access</h3>
            <p>Role-based access for residents, admins, and management.</p>
          </article>
          <article>
            <h3>Modern Dashboard</h3>
            <p>Stay organized with a simple and clean interface.</p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;

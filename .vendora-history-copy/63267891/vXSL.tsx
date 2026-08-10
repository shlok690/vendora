import { Link } from 'react-router-dom';
import './LandingPage.css';

const stats = [
  { value: '120+', label: 'Societies' },
  { value: '48,000+', label: 'Residents' },
  { value: '99.9%', label: 'Uptime' },
  { value: '₹12Cr+', label: 'Collected' },
];

const features = [
  {
    title: 'Visitor Management',
    description: 'Digital gate passes, QR-based entries and instant approvals from anywhere.',
    icon: '🛂',
  },
  {
    title: 'Maintenance & Billing',
    description: 'Automate invoices, collect payments and track dues without spreadsheets.',
    icon: '💳',
  },
  {
    title: 'Notice Board',
    description: 'Send announcements, meeting reminders and urgent alerts to the whole community.',
    icon: '📢',
  },
  {
    title: 'Complaints & Requests',
    description: 'Log issues, delegate them to staff and keep every resolution visible.',
    icon: '🛠️',
  },
  {
    title: 'Amenity Booking',
    description: 'Let residents book the clubhouse, gym or courts in seconds.',
    icon: '🏊',
  },
  {
    title: 'Security & Staff',
    description: 'Manage guards, housekeeping and attendance from one simple dashboard.',
    icon: '👮',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '₹999',
    subtitle: 'For smaller communities of up to 50 flats',
    perks: ['Visitor management', 'Notice board', 'Basic complaints', 'Email support'],
    accent: 'neutral',
  },
  {
    name: 'Growth',
    price: '₹2,499',
    subtitle: 'Perfect for expanding societies with active operations',
    perks: ['Everything in Starter', 'Maintenance billing', 'Amenity booking', 'Priority support'],
    accent: 'featured',
  },
  {
    name: 'Enterprise',
    price: '₹4,999',
    subtitle: 'For large communities with custom workflows',
    perks: ['Everything in Growth', 'Multi-tower support', 'Custom reports', 'Dedicated manager'],
    accent: 'neutral',
  },
];

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <a className="brand" href="#top">
          <span className="brand-mark">S</span>
          <span>
            <strong>SocietyOS</strong>
            <small>Management Suite</small>
          </span>
        </a>

        <nav className="landing-nav" aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <Link className="nav-button" to="/login">
          Login
        </Link>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Trusted by 120+ societies across India</p>
            <h1>
              Welcome to <span>Society Management System</span>
            </h1>
            <p className="hero-text">
              Run your residential society end-to-end with visitor logs, maintenance dues,
              notices, complaints and amenity bookings in one beautifully simple platform.
            </p>

            <div className="hero-actions">
              <Link className="primary-button" to="/login">
                Login to Continue
              </Link>
              <a className="secondary-link" href="#features">
                Explore Features
              </a>
            </div>

            <div className="stats-grid">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-label="Dashboard preview">
            <div className="preview-card">
              <div className="preview-header">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
              <div className="preview-body">
                <div className="preview-panel preview-panel-large">
                  <p>Community Overview</p>
                  <h3>342 residents</h3>
                  <span>+12 this month</span>
                </div>
                <div className="preview-grid">
                  <div className="preview-panel">
                    <p>Visitors</p>
                    <h3>28</h3>
                    <span>+6 vs yesterday</span>
                  </div>
                  <div className="preview-panel">
                    <p>Dues</p>
                    <h3>₹4.7L</h3>
                    <span>18 flats pending</span>
                  </div>
                  <div className="preview-panel">
                    <p>Complaints</p>
                    <h3>12</h3>
                    <span>3 urgent</span>
                  </div>
                  <div className="preview-panel">
                    <p>Bookings</p>
                    <h3>9</h3>
                    <span>Pool today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="section-heading">
            <p className="eyebrow">What we offer</p>
            <h2>Everything a modern society needs.</h2>
            <p>
              Replace WhatsApp groups, paper registers and Excel sheets with one delightful
              platform built for committees, residents and staff alike.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="section-heading">
            <p className="eyebrow">Pricing</p>
            <h2>Simple, transparent plans.</h2>
            <p>Start free for 14 days. Cancel anytime. No credit card required.</p>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => (
              <article key={plan.name} className={`pricing-card ${plan.accent}`}>
                {plan.accent === 'featured' ? <span className="pill">Most Popular</span> : null}
                <h3>{plan.name}</h3>
                <p className="plan-subtitle">{plan.subtitle}</p>
                <div className="price-row">
                  <strong>{plan.price}</strong>
                  <span>/mo</span>
                </div>
                <ul>
                  {plan.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <Link className="plan-button" to="/register">
                  Get started
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section about-section" id="about">
          <div>
            <p className="eyebrow">Why communities love us</p>
            <h2>Less admin. More connection.</h2>
            <p>
              SocietyOS brings the committee, residents and staff onto the same real-time
              system so issues are clearer, communication is faster and operations feel calm.
            </p>
          </div>
          <div className="about-card">
            <h3>Built for modern residential communities</h3>
            <p>
              From gated apartments and villas to large multi-tower complexes, our platform keeps
              every service transparent and efficient.
            </p>
          </div>
        </section>
      </main>

      <footer className="landing-footer" id="contact">
        <div className="brand footer-brand">
          <span className="brand-mark">S</span>
          <span>
            <strong>SocietyOS</strong>
            <small>Management Suite</small>
          </span>
        </div>
        <p>© 2026 SocietyOS · Built for modern residential communities</p>
      </footer>
    </div>
  );
}

export default LandingPage;

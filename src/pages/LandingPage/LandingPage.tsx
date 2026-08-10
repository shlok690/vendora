import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LandingPage.css';

/* ── Data ── */
const categories = [
  { label: 'Furniture',    icon: '🪑', bg: 'linear-gradient(135deg,#d4a373,#a98467)', emoji: '🛋️' },
  { label: 'Clothing',     icon: '👗', bg: 'linear-gradient(135deg,#b8c0cc,#8d99ae)', emoji: '👕' },
  { label: 'Handicrafts',  icon: '🧶', bg: 'linear-gradient(135deg,#c9b1bd,#967aa1)', emoji: '🎨' },
  { label: 'Electronics',  icon: '💡', bg: 'linear-gradient(135deg,#90e0ef,#0096c7)', emoji: '📱' },
  { label: 'Food & Spices',icon: '🌶️', bg: 'linear-gradient(135deg,#f4a261,#e76f51)', emoji: '🍛' },
  { label: 'Jewellery',    icon: '💍', bg: 'linear-gradient(135deg,#ffd166,#ef9c00)', emoji: '✨' },
];

const vendors = [
  { name: 'Riya Crafts',     category: 'Handicrafts', rating: '4.9', products: 48, cover: 'linear-gradient(135deg,#fce4d6,#f9bba0)', avatar: '🎨' },
  { name: 'TechNook Store',  category: 'Electronics', rating: '4.7', products: 63, cover: 'linear-gradient(135deg,#d0f0fd,#90d5f5)', avatar: '📱' },
  { name: 'Weavers Hub',     category: 'Clothing',    rating: '4.8', products: 31, cover: 'linear-gradient(135deg,#e8d5f5,#c5a4e5)', avatar: '👗' },
  { name: 'Spice Trail',     category: 'Food',        rating: '4.6', products: 22, cover: 'linear-gradient(135deg,#fef3c7,#fcd34d)', avatar: '🌶️' },
];

const vendorSteps = [
  { icon: '📝', title: 'Create your store', desc: 'Set up your profile, add your store name and description in minutes.' },
  { icon: '📦', title: 'List your products', desc: 'Upload photos, set prices and manage your inventory easily.' },
  { icon: '💰', title: 'Start earning', desc: 'Receive orders, get paid securely and grow your local business.' },
];

const customerSteps = [
  { icon: '🔍', title: 'Discover shops',    desc: 'Explore hundreds of local vendors across every category.' },
  { icon: '🛒', title: 'Add to cart',       desc: 'Pick the products you love from trusted local sellers.' },
  { icon: '🚀', title: 'Fast delivery',     desc: 'Get your order delivered quickly, right to your door.' },
];

const stats = [
  { value: '2,400+', label: 'Active Vendors' },
  { value: '18K+',   label: 'Products Listed' },
  { value: '94K+',   label: 'Happy Customers' },
  { value: '₹4.2Cr', label: 'Revenue Generated' },
];

/* ── Scroll-reveal hook ── */
function useReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
        });
      },
      { threshold: 0.10 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);
}

/* ── Sticky header shadow ── */
function useHeaderScroll() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const fn = () => el.classList.toggle('scrolled', window.scrollY > 16);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return ref;
}

/* ── Component ── */
export default function LandingPage() {
  const { currentUser, userProfile, userRole } = useAuth();
  const [search, setSearch] = useState('');

  const displayName = userProfile?.displayName ?? currentUser?.email?.split('@')[0];
  const dashPath = userRole === 'admin' ? '/admin-dashboard' : userRole === 'vendor' ? '/seller-dashboard' : '/buyer-dashboard';

  useReveal();
  const headerRef = useHeaderScroll();

  return (
    <div className="lp">
      {/* ── Header ── */}
      <header className="lp-header" ref={headerRef as React.RefObject<HTMLElement>}>
        <div className="lp-header-inner">
          <a className="lp-brand" href="#top">
            <img src="/vendora-logo.jpg" alt="Vendora" className="lp-brand-logo" />
          </a>

          <div className="lp-header-cta">
            {currentUser && displayName ? (
              <Link className="btn btn-blue" to={dashPath}>
                {displayName} →
              </Link>
            ) : (
              <>
                <Link className="btn btn-ghost" to="/login">Login</Link>
                <Link className="btn btn-solid" to="/register">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="top">
        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              2,400+ Local Vendors on Vendora
            </div>

            <h1>
              Your Business.<br />
              Your Store. <span className="accent">Your Rules.</span>
            </h1>

            <p className="hero-desc">
              Vendora connects local vendors and artisans with customers who love discovering unique,
              handcrafted and locally sourced products.
            </p>

            {/* Search */}
            <div className="hero-search">
              <span className="hero-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search for products or shops…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="hero-search-btn">Search</button>
            </div>

            {/* Categories */}
            <div className="categories" id="categories">
              {categories.map((cat) => (
                <div key={cat.label} className="cat-card">
                  <div style={{ width: '100%', height: '100%', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    {cat.emoji}
                  </div>
                  <div className="cat-card-overlay" />
                  <span className="cat-card-icon">{cat.icon}</span>
                  <span className="cat-card-label">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <div className="stats-banner">
          <div className="stats-banner-inner">
            {stats.map((s) => (
              <div className="stat-item reveal" key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Featured Vendors ── */}
        <section className="section" id="vendors">
          <div className="container">
            <div className="section-heading reveal">
              <div className="section-label">Featured Vendor Shops</div>
              <h2>Discover top local sellers.</h2>
              <p>Browse handpicked vendors with great products, stellar reviews and fast delivery.</p>
            </div>

            <div className="vendors-grid">
              {vendors.map((v, i) => (
                <div key={v.name} className={`vendor-card reveal reveal-delay-${i + 1}`}>
                  <div className="vendor-cover" style={{ background: v.cover }}>
                    <div className="vendor-avatar">{v.avatar}</div>
                  </div>
                  <div className="vendor-body">
                    <div className="vendor-name">{v.name}</div>
                    <div className="vendor-category">{v.category}</div>
                    <div className="vendor-meta">
                      <span>⭐ {v.rating}</span>
                      <span>📦 {v.products} products</span>
                    </div>
                    <Link to="/register/buyer" className="vendor-shop-btn">Shop Now</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="section section-alt" id="how-it-works">
          <div className="container">
            {/* For Vendors */}
            <div className="section-heading reveal">
              <div className="section-label">For Vendors</div>
              <h2>Sell in 3 simple steps.</h2>
              <p>Set up your store in minutes and start reaching customers across your city.</p>
            </div>

            <div className="how-grid" style={{ marginBottom: 64 }}>
              {vendorSteps.map((step, i) => (
                <div key={step.title} className={`how-card reveal reveal-delay-${i + 1}`}>
                  <div className="how-step">{i + 1}</div>
                  <div className="how-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>

            {/* For Customers */}
            <div className="section-heading reveal">
              <div className="section-label">For Customers</div>
              <h2>Shop local, shop smart.</h2>
              <p>Find unique products from nearby vendors and support local businesses.</p>
            </div>

            <div className="how-grid">
              {customerSteps.map((step, i) => (
                <div key={step.title} className={`how-card reveal reveal-delay-${i + 1}`}>
                  <div className="how-step">{i + 1}</div>
                  <div className="how-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="container">
            <h2 className="reveal">Ready to grow your business?</h2>
            <p className="reveal">Join thousands of vendors already selling on Vendora — it's free to start.</p>
            <div className="cta-actions reveal">
              <Link className="btn btn-blue-lg" to="/register/seller">Start Selling Free 🏪</Link>
              <Link className="btn btn-outline-lg" to="/register/buyer">Browse as Customer 🛍️</Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer" id="contact">
        <div className="lp-footer-inner">
          <a className="lp-brand" href="#top">
            <img src="/vendora-logo.jpg" alt="Vendora" className="lp-brand-logo" />
          </a>
          <span className="lp-footer-copy">© 2026 Vendora. All rights reserved.</span>
          <div className="lp-footer-links">
            <a href="#categories">Explore</a>
            <a href="#vendors">Vendors</a>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WaveBackground from '../../components/WaveBackground';
import Logo from '../../components/Logo';
import './LandingPage.css';

/* ── Data ── */
const categories = [
  { label: 'Furniture',     image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80' },
  { label: 'Clothing',      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80' },
  { label: 'Handicrafts',   image: 'https://images.unsplash.com/photo-1609881583302-61548332039c?auto=format&fit=crop&w=400&q=80' },
  { label: 'Electronics',   image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=400&q=80' },
  { label: 'Food & Spices', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Jewellery',     image: 'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?auto=format&fit=crop&w=400&q=80' },
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
  const dashPath = userRole === 'vendor' ? '/seller-dashboard' : '/buyer-dashboard';

  useReveal();
  const headerRef = useHeaderScroll();

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="lp">
      {/* ── Header ── */}
      <header className="lp-header" ref={headerRef as React.RefObject<HTMLElement>}>
        <div className="lp-header-inner">
          <a className="lp-brand" href="/" onClick={scrollToTop}>
            <Logo size={26} />
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
          <WaveBackground />
          <div className="hero-inner">
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
                  <img src={cat.image} alt={cat.label} loading="lazy" />
                  <div className="cat-card-overlay" />
                  <span className="cat-card-label">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

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

      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer" id="contact">
        <div className="lp-footer-inner">
          <a className="lp-brand" href="/" onClick={scrollToTop}>
            <Logo size={26} />
          </a>
          <span className="lp-footer-copy">© 2026 Vendora. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

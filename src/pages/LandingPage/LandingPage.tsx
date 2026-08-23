import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WaveBackground from '../../components/WaveBackground';
import Logo from '../../components/Logo';
import Icon, { type IconName } from '../../components/Icon';
import { useMagnetic, useReveal, useScrollProgress, useTilt, useTypewriter } from '../../components/interactions';
import './LandingPage.css';

/* ── Data ── */
const categories: { label: string; icon: IconName; image: string }[] = [
  { label: 'Furniture',     icon: 'chair',  image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80' },
  { label: 'Clothing',      icon: 'shirt',  image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80' },
  { label: 'Handicrafts',   icon: 'craft',  image: 'https://images.unsplash.com/photo-1609881583302-61548332039c?auto=format&fit=crop&w=400&q=80' },
  { label: 'Electronics',   icon: 'device', image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=400&q=80' },
  { label: 'Food & Spices', icon: 'spice',  image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Jewellery',     icon: 'gem',    image: 'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?auto=format&fit=crop&w=400&q=80' },
];

const vendors: { name: string; category: string; icon: IconName; city: string; tone: string }[] = [
  { name: 'Riya Crafts',    category: 'Handicrafts', icon: 'craft',  city: 'Jaipur',    tone: 'clay' },
  { name: 'TechNook Store', category: 'Electronics', icon: 'device', city: 'Bengaluru', tone: 'jade' },
  { name: 'Weavers Hub',    category: 'Clothing',    icon: 'shirt',  city: 'Varanasi',  tone: 'saffron' },
  { name: 'Spice Trail',    category: 'Food',        icon: 'spice',  city: 'Kochi',     tone: 'clay' },
];

const journeys: Record<'vendor' | 'customer', { label: string; blurb: string; cta: string; href: string; steps: { icon: IconName; title: string; desc: string }[] }> = {
  vendor: {
    label: 'Vendor',
    blurb: 'Set up a storefront in an afternoon and reach customers across your city — no commission on your first hundred orders.',
    cta: 'Open your store',
    href: '/register/seller',
    steps: [
      { icon: 'storefront', title: 'Create your store', desc: 'Claim your shop name, add a description and pick a look that fits your craft.' },
      { icon: 'box',        title: 'List your products', desc: 'Upload photos, set your own prices and keep inventory in one place.' },
      { icon: 'coins',      title: 'Start earning',      desc: 'Take orders, get paid securely and watch your local business grow.' },
    ],
  },
  customer: {
    label: 'Customer',
    blurb: 'Find the makers behind the things you love — and know exactly whose hands made what you bought.',
    cta: 'Start exploring',
    href: '/register/buyer',
    steps: [
      { icon: 'compass', title: 'Discover shops', desc: 'Browse hundreds of local vendors across every category near you.' },
      { icon: 'cart',    title: 'Add to cart',    desc: 'Pick out pieces from sellers with real reviews and honest pricing.' },
      { icon: 'truck',   title: 'Fast delivery',  desc: 'Get your order brought to your door, often within a day or two.' },
    ],
  },
};

const searchHints = [
  'handwoven baskets…',
  'cold-pressed oils…',
  'a potter in Jaipur…',
  'block-printed cotton…',
  'silver jhumkas…',
];

/* ── Sticky header shadow ── */
function useHeaderScroll() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fn = () => el.classList.toggle('scrolled', window.scrollY > 24);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return ref;
}

/* ── Vendor card with pointer-tracked tilt + glare ── */
function VendorCard({ v, index }: { v: (typeof vendors)[number]; index: number }) {
  const tilt = useTilt(7);
  return (
    <article
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className={`vendor-card tone-${v.tone} reveal reveal-delay-${index + 1}`}
    >
      <div className="vendor-glare" aria-hidden="true" />
      <div className="vendor-cover">
        <Icon name={v.icon} size={30} strokeWidth={1.4} />
      </div>
      <div className="vendor-body">
        <h3 className="vendor-name">{v.name}</h3>
        <div className="vendor-sub">
          <Icon name="pin" size={13} strokeWidth={1.7} />
          {v.city} · {v.category}
        </div>
        <div className="vendor-foot">
          <Link to="/register/buyer" className="vendor-shop-btn">
            Visit shop
            <Icon name="arrowUpRight" size={15} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ── Component ── */
export default function LandingPage() {
  const { currentUser, userProfile, userRole } = useAuth();
  const [search, setSearch] = useState('');
  const [journey, setJourney] = useState<'vendor' | 'customer'>('vendor');
  const navigate = useNavigate();

  const displayName = userProfile?.displayName ?? currentUser?.email?.split('@')[0];
  const dashPath = userRole === 'vendor' ? '/seller-dashboard' : '/buyer-dashboard';

  useReveal([journey]);
  const headerRef = useHeaderScroll();
  const progress = useScrollProgress();
  const heroCta = useMagnetic();
  const hint = useTypewriter(searchHints, search.length === 0);

  const active = journeys[journey];

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToProducts = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(search.trim() ? `/products?q=${encodeURIComponent(search.trim())}` : '/products');
  };

  return (
    <div className="lp">
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      {/* ── Header ── */}
      <header className="lp-header" ref={headerRef as React.RefObject<HTMLElement>}>
        <div className="lp-header-inner">
          <a className="lp-brand" href="/" onClick={scrollToTop}>
            <Logo size={22} />
          </a>

          <div className="lp-header-cta">
            {currentUser && displayName ? (
              <Link className="btn btn-solid" to={dashPath}>
                {displayName}
                <Icon name="arrowRight" size={15} strokeWidth={2} />
              </Link>
            ) : (
              <>
                <Link className="btn btn-ghost" to="/login">Login</Link>
                <Link className="btn btn-solid" to="/register">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="top">
        {/* ── Hero ── */}
        <section className="hero grain">
          <WaveBackground />
          <div className="hero-inner">
            <h1 className="hero-title">
              <span className="line"><span>Your business.</span></span>
              <span className="line"><span>Your storefront.</span></span>
              <span className="line">
                <span>
                  Your&nbsp;
                  <em className="accent">
                    <span className="accent-text">rules.</span>
                    <span className="accent-underline" aria-hidden="true">
                      <svg viewBox="0 0 240 18" preserveAspectRatio="none">
                        <path d="M3 12.5C48 5.5 152 3.2 237 8.6" />
                      </svg>
                    </span>
                  </em>
                </span>
              </span>
            </h1>

            <p className="hero-desc">
              Vendora is where local makers keep their own shop, their own prices and their own
              customers — and where you find the people behind what you buy.
            </p>

            {/* Search */}
            <form className="hero-search" onSubmit={goToProducts}>
              <Icon name="search" size={19} className="hero-search-icon" />
              <input
                type="text"
                aria-label="Search products or shops"
                placeholder={`Search for ${hint}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                className="hero-search-btn"
                ref={heroCta.ref}
                onPointerMove={heroCta.onPointerMove}
                onPointerLeave={heroCta.onPointerLeave}
              >
                Search
              </button>
            </form>

          </div>
        </section>

        {/* ── Category marquee ── */}
        <section className="market" id="market" aria-label="Shop by category">
          <div className="marquee">
            <div className="marquee-track">
              {[...categories, ...categories].map((cat, i) => (
                <Link
                  key={`${cat.label}-${i}`}
                  to={`/products?category=${encodeURIComponent(cat.label)}`}
                  className="cat-card"
                  aria-hidden={i >= categories.length}
                  tabIndex={i >= categories.length ? -1 : undefined}
                >
                  <img src={cat.image} alt="" loading="lazy" />
                  <span className="cat-veil" />
                  <span className="cat-label">
                    <Icon name={cat.icon} size={17} strokeWidth={1.7} />
                    {cat.label}
                  </span>
                  <span className="cat-go"><Icon name="arrowUpRight" size={15} strokeWidth={2} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works — switchable journey ── */}
        <section className="section section-alt" id="journey">
          <div className="container">
            <header className="section-heading reveal">
              <span className="section-label">How it works</span>
              <h2>Two ways in.</h2>
              <p>Whichever side of the counter you're on, it takes about three steps.</p>
            </header>

            <div className="journey-switch reveal" role="tablist" aria-label="Choose your path">
              <span className={`journey-thumb ${journey}`} aria-hidden="true" />
              {(['vendor', 'customer'] as const).map((key) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={journey === key}
                  className={`journey-tab${journey === key ? ' active' : ''}`}
                  onClick={() => setJourney(key)}
                >
                  {journeys[key].label}
                </button>
              ))}
            </div>

            <p className="journey-blurb reveal">{active.blurb}</p>

            <ol className="steps" key={journey}>
              {active.steps.map((step, i) => (
                <li className="step" key={step.title} style={{ '--i': i } as React.CSSProperties}>
                  <div className="step-rail" aria-hidden="true">
                    <span className="step-dot">{i + 1}</span>
                  </div>
                  <div className="step-body">
                    <Icon name={step.icon} size={26} strokeWidth={1.5} className="step-icon" />
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="journey-cta reveal">
              <Link className="btn btn-clay btn-lg" to={active.href}>
                {active.cta}
                <Icon name="arrowRight" size={17} strokeWidth={2} />
              </Link>
              <span className="journey-note">Free to join · no listing fees</span>
            </div>
          </div>
        </section>

        {/* ── Featured Vendors ── */}
        <section className="section" id="vendors">
          <div className="container">
            <header className="section-heading reveal">
              <span className="section-label">Featured shops</span>
              <h2>The people behind<br />the products.</h2>
              <p>
                Every shop on Vendora is run by the person who makes or sources what's in it.
                Here are a few worth knowing.
              </p>
            </header>

            <div className="vendors-grid">
              {vendors.map((v, i) => (
                <VendorCard key={v.name} v={v} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="closing grain">
          <div className="container closing-inner reveal">
            <h2>Start where you are.</h2>
            <p>Open a shop, or find one down the road. Both take about a minute.</p>
            <div className="closing-actions">
              <Link className="btn btn-clay btn-lg" to="/register/seller">
                Sell on Vendora
                <Icon name="arrowRight" size={17} strokeWidth={2} />
              </Link>
              <Link className="btn btn-outline-light btn-lg" to="/products">Browse the market</Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer" id="contact">
        <div className="container lp-footer-inner">
          <a className="lp-brand" href="/" onClick={scrollToTop}>
            <Logo size={22} />
          </a>
          <span className="lp-footer-copy">© 2026 Vendora</span>
        </div>
      </footer>
    </div>
  );
}

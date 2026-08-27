import React, { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';
import Logo from '../../components/Logo';
import { useVendorProducts } from '../../hooks/useVendorProducts';
import { normalizeCategories } from '../../utils/categories';
import { normalizeUiStyle } from '../../utils/uiStyle';
import { formatPrice } from '../../utils/format';
import './Storefront.css';

/**
 * The vendor's storefront — their own categories and products, drawn in
 * whichever of the three UI styles they picked. The style is applied as a
 * `data-ui-style` attribute; each one redefines the page's design tokens, so
 * there is one set of markup rather than three.
 */

/** Theme colours are vendor-chosen, so hero text has to adapt or go unreadable. */
const isLightColor = (color: string): boolean => {
  if (!color.startsWith('#')) return false; // the CSS-var presets are all dark
  const hex = color.slice(1);
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return false;
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
};

const StorefrontPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { products, loading } = useVendorProducts();
  const shop = userProfile?.shopProfile;

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => normalizeCategories(shop?.categories), [shop?.categories]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (activeCategory !== 'All' && p.category !== activeCategory) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
  }, [products, activeCategory, search]);

  // Setup isn't finished — the dashboard puts them back in the wizard.
  if (!shop) return <Navigate to="/seller-dashboard" replace />;

  const theme = shop.themeColor || 'var(--ink)';
  const uiStyle = normalizeUiStyle(shop.uiStyle);
  const onLight = isLightColor(theme);
  const initial = (shop.shopName.trim()[0] || 'V').toUpperCase();
  const hasBanner = Boolean(shop.bannerDataUrl);

  const heroStyle: React.CSSProperties = {
    backgroundColor: theme,
    backgroundImage: shop.bannerDataUrl ? `url(${shop.bannerDataUrl})` : undefined,
    color: onLight && !hasBanner ? 'var(--ink)' : '#fff',
  };

  return (
    <div className="storefront-page" data-ui-style={uiStyle} style={{ ['--shop-theme' as string]: theme }}>
      {/* Vendor-only bar: this route is the vendor previewing their own shop. */}
      <div className="storefront-owner-bar">
        <span className="storefront-owner-note">
          <Icon name="eye" size={15} />
          This is your storefront as buyers see it
        </span>
        <Link to="/seller-dashboard" className="storefront-owner-back">
          <Icon name="arrowRight" size={14} />
          Back to dashboard
        </Link>
      </div>

      <header className={`storefront-hero${hasBanner ? ' has-banner' : ''}`} style={heroStyle}>
        <div className="storefront-hero-inner">
          <div className="storefront-brand">
            <div className="storefront-logo">
              {shop.logoDataUrl
                ? <img src={shop.logoDataUrl} alt={`${shop.shopName} logo`} />
                : <span>{initial}</span>}
            </div>
            <div className="storefront-brand-text">
              <h1 className="storefront-name">{shop.shopName}</h1>
              <div className="storefront-meta">
                <span className="storefront-chip">{shop.businessType}</span>
                {shop.city && (
                  <span className="storefront-chip">
                    <Icon name="pin" size={12} />
                    {shop.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {shop.shopDescription && <p className="storefront-tagline">{shop.shopDescription}</p>}

          <label className="storefront-search">
            <Icon name="search" size={15} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${shop.shopName || 'this shop'}…`}
              aria-label={`Search ${shop.shopName}`}
            />
          </label>
        </div>
      </header>

      {categories.length > 0 && (
        <nav className="storefront-cats" aria-label="Product categories">
          <div className="storefront-cats-inner">
            <button
              type="button"
              className={`storefront-cat${activeCategory === 'All' ? ' active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              <span className="storefront-cat-thumb"><Icon name="grid" size={16} /></span>
              <span className="storefront-cat-label">All</span>
            </button>

            {categories.map((c) => (
              <button
                key={c.name}
                type="button"
                className={`storefront-cat${activeCategory === c.name ? ' active' : ''}`}
                onClick={() => setActiveCategory(c.name)}
              >
                <span className="storefront-cat-thumb">
                  {c.imageDataUrl
                    ? <img src={c.imageDataUrl} alt="" />
                    : <Icon name="box" size={16} />}
                </span>
                <span className="storefront-cat-label">{c.name}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="storefront-body">
        <div className="storefront-section-head">
          <h2>{activeCategory === 'All' ? 'Products' : activeCategory}</h2>
          <span className="storefront-count">
            {loading ? 'Loading…' : `${visible.length} item${visible.length === 1 ? '' : 's'}`}
          </span>
        </div>

        {loading ? (
          <div className="storefront-grid">
            {[0, 1, 2, 3].map((i) => <div key={i} className="storefront-card storefront-card-skeleton" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="storefront-empty">
            <Icon name="box" size={26} />
            {products.length === 0 ? (
              <>
                <p>No products listed yet.</p>
                <Link to="/seller-dashboard">Add your first product</Link>
              </>
            ) : (
              <>
                <p>Nothing here matches that.</p>
                <button type="button" onClick={() => { setSearch(''); setActiveCategory('All'); }}>
                  Show everything
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="storefront-grid">
            {visible.map((p) => (
              <article key={p.id} className="storefront-card">
                <div className="storefront-card-media">
                  {p.imageDataUrl
                    ? <img src={p.imageDataUrl} alt="" className="storefront-card-img" loading="lazy" />
                    : <span className="storefront-card-placeholder"><Icon name="box" size={22} /></span>}
                  {p.stock === 0 && <span className="storefront-card-flag">Out of stock</span>}
                </div>

                <div className="storefront-card-body">
                  <h3 className="storefront-card-name">{p.name}</h3>
                  {p.description && <p className="storefront-card-desc">{p.description}</p>}
                  <div className="storefront-card-row">
                    <span className="storefront-card-price">{formatPrice(p.price)}</span>
                    {p.category && <span className="storefront-card-cat">{p.category}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="storefront-footer">
        <div className="storefront-footer-inner">
          <div className="storefront-footer-brand">
            <Logo size={20} inverted />
            <p>{shop.shopName}</p>
          </div>

          <div className="storefront-contact">
            {shop.whatsapp && (
              <a href={`https://wa.me/${shop.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer">
                <Icon name="chat" size={15} />
                {shop.whatsapp}
              </a>
            )}
            {shop.contactEmail && (
              <a href={`mailto:${shop.contactEmail}`}>
                <Icon name="mail" size={15} />
                {shop.contactEmail}
              </a>
            )}
            {shop.city && (
              <span>
                <Icon name="pin" size={15} />
                {shop.city}
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontPage;
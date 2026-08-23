import React, { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';
import Logo from '../../components/Logo';
import { PRODUCTS } from '../../constants/products';
import './Storefront.css';

/**
 * The vendor's storefront — the live page the wizard's step 3 previews in
 * miniature, rendered full size from the same shopProfile fields.
 */

/** Theme colours are vendor-chosen, so the hero text has to adapt or it goes unreadable. */
const isLightColor = (color: string): boolean => {
  if (!color.startsWith('#')) return false; // CSS vars used as presets are all dark
  const hex = color.slice(1);
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return false;
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
};

const StorefrontPage: React.FC = () => {
  const { userProfile } = useAuth();
  const shop = userProfile?.shopProfile;
  const [search, setSearch] = useState('');

  // Products aren't a data model yet — show the catalogue entries that match the
  // shop's own category so the page reads like a real storefront.
  const catalogue = useMemo(() => {
    if (!shop) return [];
    const inCategory = PRODUCTS.filter((p) => p.category === shop.businessType);
    return inCategory.length > 0 ? inCategory : PRODUCTS.slice(0, 6);
  }, [shop]);

  const products = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalogue;
    return catalogue.filter((p) => p.name.toLowerCase().includes(q));
  }, [catalogue, search]);

  // Setup isn't finished — the dashboard will put them back in the wizard.
  if (!shop) return <Navigate to="/seller-dashboard" replace />;

  const theme = shop.themeColor || 'var(--ink)';
  const onLight = isLightColor(theme);
  const layout = shop.layoutStyle || 'gallery';
  const initial = (shop.shopName.trim()[0] || 'V').toUpperCase();

  const heroStyle: React.CSSProperties = {
    backgroundColor: theme,
    backgroundImage: shop.bannerDataUrl ? `url(${shop.bannerDataUrl})` : undefined,
    color: onLight && !shop.bannerDataUrl ? 'var(--ink)' : '#fff',
  };

  return (
    <div className="storefront-page" style={{ ['--shop-theme' as string]: theme }}>
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

      <header
        className={`storefront-hero storefront-hero-${layout}${shop.bannerDataUrl ? ' has-banner' : ''}`}
        style={heroStyle}
      >
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

      <main className="storefront-body">
        <div className="storefront-section-head">
          <h2>Products</h2>
          <span className="storefront-count">{products.length} item{products.length === 1 ? '' : 's'}</span>
        </div>

        {products.length === 0 ? (
          <div className="storefront-empty">
            <Icon name="box" size={26} />
            <p>No products match “{search.trim()}”.</p>
            <button type="button" onClick={() => setSearch('')}>Clear search</button>
          </div>
        ) : (
          <div className="storefront-grid">
            {products.map((p) => (
              <article key={p.name} className="storefront-card">
                <img src={p.image} alt="" className="storefront-card-img" loading="lazy" />
                <div className="storefront-card-body">
                  <h3 className="storefront-card-name">{p.name}</h3>
                  <div className="storefront-card-row">
                    <span className="storefront-card-price">{p.price}</span>
                    <span className="storefront-card-cat">{p.category}</span>
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

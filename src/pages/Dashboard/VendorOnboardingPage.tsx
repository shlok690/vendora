import React, { useState } from 'react';
import { useAuth, type VendorShopProfile } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import VendorOnboardingWizard, { BUSINESS_TYPES, CITY_SUGGESTIONS } from './VendorOnboardingWizard';
import Logo from '../../components/Logo';
import UserMenu from '../../components/UserMenu';
import Icon from '../../components/Icon';
import ColorPicker, { THEME_PRESETS } from '../../components/ColorPicker';
import { isHexColor, normalizeHex } from '../../utils/color';
import { DEFAULT_THEME_COLOR } from '../../utils/onboardingDraft';
import { whatsappLink } from '../../utils/vendorStats';
import { useVendorProducts } from '../../hooks/useVendorProducts';
import { categoryNames, normalizeCategories, type ShopCategory } from '../../utils/categories';
import CategoriesModal from './CategoriesModal';
import ProductFormModal from './ProductFormModal';
import StyleModal from './StyleModal';
import { formatPrice } from '../../utils/format';
import { UI_STYLES, normalizeUiStyle, type UiStyle } from '../../utils/uiStyle';
import type { VendorProduct } from '../../services/products';
import './Dashboard.css';

const settingsInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1.5px solid var(--line)',
  fontSize: '0.92rem',
  fontFamily: 'inherit',
  color: 'var(--ink)',
  outline: 'none',
  boxSizing: 'border-box',
};
const settingsLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: 'var(--ink-2)',
  marginBottom: 6,
};

const VendorOnboardingPage: React.FC = () => {
  const { userProfile, logout, saveVendorShopProfile } = useAuth();
  const { products, loading: productsLoading, upsert, remove } = useVendorProducts();
  const { showToast } = useToast();
  const navigate = useNavigate();
  // The nav column is gone — the overview is the dashboard, and shop details
  // open from it rather than from a sidebar.
  const [view, setView] = useState<'overview' | 'settings'>('overview');

  // Editing happens in pop-ups so the dashboard itself stays a calm surface.
  const [productModal, setProductModal] = useState<{
    open: boolean;
    editing: VendorProduct | null;
  }>({ open: false, editing: null });
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [filter, setFilter] = useState('All');

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'info');
      navigate('/login');
    } catch (err) {
      showToast('Failed to log out. Please try again.', 'error');
    }
  };

  if (!userProfile?.shopProfile) {
    return <VendorOnboardingWizard />;
  }

  const shop = userProfile.shopProfile;
  const waLink = whatsappLink(shop.whatsapp);
  // Normalised on read so categories saved as plain strings still load.
  const categories = normalizeCategories(shop.categories);
  const countInCategory = (name: string) => products.filter((p) => p.category === name).length;

  // Categories and the chosen style sit on the shop profile, so saving either
  // is a merge of the whole profile.
  const saveShop = async (patch: Partial<typeof shop>) => {
    const synced = await saveVendorShopProfile({ ...shop, ...patch });
    if (!synced) showToast('Saved on this device — it will sync when the connection returns', 'info');
    return synced;
  };

  const saveCategories = (next: ShopCategory[]) => saveShop({ categories: next });

  /** Used by the product form when a product needs a category that doesn't exist yet. */
  const addCategory = (name: string) => saveCategories([...categories, { name }]);

  const saveUiStyle = async (style: UiStyle) => {
    const synced = await saveShop({ uiStyle: style });
    if (synced) showToast('Storefront style updated', 'success');
    return synced;
  };

  const styleLabel = UI_STYLES.find((s) => s.id === normalizeUiStyle(shop.uiStyle))?.label ?? '';
  const shown = filter === 'All' ? products : products.filter((p) => p.category === filter);
  const theme = shop.themeColor || 'var(--ink)';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, var(--paper-2) 0%, var(--paper) 55%)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-brand">
          <Link to="/" className="dash-brand-link" aria-label="Vendora home">
            <Logo size={24} />
          </Link>
          <span className="dash-header-subtitle" style={{ fontSize: '0.8rem', color: 'var(--faint)', marginLeft: 6 }}>
            Vendor Dashboard
          </span>
        </div>
        <div className="dash-header-actions">
          {/* The storefront is reachable from the hero card and the account
              menu, so the header keeps only the account control. */}
          <UserMenu
            name={userProfile?.displayName || userProfile?.email?.split('@')[0] || 'Vendor'}
            email={userProfile?.email}
            roleLabel="Vendor"
            onLogout={handleLogout}
            viewSiteTo="/my-shop"
            onShopDetails={() => setView('settings')}
          />
        </div>
      </header>

      <div className="dash-layout">
        {/* Main */}
        <main style={{ flex: 1 }}>
          {view === 'overview' && (
            <div className="dash-work">
              {/* Hero: the shop wearing its own theme colour, so the dashboard
                  looks like the storefront it manages rather than a form. */}
              <section className="dash-hero" style={{ ['--hero' as string]: theme } as React.CSSProperties}>
                <span className="dash-hero-glow" aria-hidden="true" />
                <div className="dash-hero-top">
                  <div className="dash-hero-mark" style={{ background: theme }}>
                    {shop.logoDataUrl ? (
                      <img src={shop.logoDataUrl} alt="" />
                    ) : (
                      <span>{(shop.shopName.trim()[0] || 'V').toUpperCase()}</span>
                    )}
                  </div>
                  <div className="dash-hero-titles">
                    <p className="dash-hero-eyebrow">Welcome, {userProfile?.displayName?.split(' ')[0] || 'Vendor'}</p>
                    <h1 className="dash-hero-name">{shop.shopName}</h1>
                    <p className="dash-hero-meta">
                      <span>{shop.businessType}</span>
                      {/* Each separator travels with the value it precedes, so a
                          wrap never leaves a dangling dot at the end of a line. */}
                      {shop.city && (
                        <span>
                          <i className="dash-dot" />
                          {shop.city}
                        </span>
                      )}
                      {waLink && (
                        <span>
                          <i className="dash-dot" />
                          <a href={waLink} target="_blank" rel="noreferrer">
                            {shop.whatsapp}
                          </a>
                        </span>
                      )}
                    </p>
                  </div>
                  <Link to="/my-shop" className="dash-hero-cta">
                    <Icon name="storefront" size={15} />
                    View storefront
                  </Link>
                </div>

                <div className="dash-hero-stats">
                  <button
                    type="button"
                    className="dash-stat"
                    onClick={() => setProductModal({ open: true, editing: null })}
                  >
                    <Icon name="box" size={16} />
                    <strong>{productsLoading ? '—' : products.length}</strong>
                    <span>Products</span>
                  </button>
                  <button type="button" className="dash-stat" onClick={() => setCategoriesOpen(true)}>
                    <Icon name="grid" size={16} />
                    <strong>{categories.length}</strong>
                    <span>Categories</span>
                  </button>
                  <button type="button" className="dash-stat dash-stat-wide" onClick={() => setStyleOpen(true)}>
                    <Icon name="sparkle" size={16} />
                    <strong>{styleLabel}</strong>
                    <span>Storefront style</span>
                  </button>
                </div>
              </section>

              {/* Nothing to list yet: the hero card is the whole dashboard, and
                  its tiles are how you add the first product or category. */}
              {(productsLoading || products.length > 0) && (
                <>
                  {/* Toolbar: everything that opens a pop-up, in one row. */}
                  <div className="dash-bar">
                    <h2 className="dash-bar-title">
                      Products
                      {!productsLoading && products.length > 0 && <em>{products.length}</em>}
                    </h2>
                    <div className="dash-bar-actions">
                      <button type="button" className="btn-quiet" onClick={() => setCategoriesOpen(true)}>
                        <Icon name="grid" size={14} />
                        Categories
                      </button>
                      <button
                        type="button"
                        className="btn-solid dash-bar-add"
                        onClick={() => setProductModal({ open: true, editing: null })}
                      >
                        <span aria-hidden="true">+</span>
                        Add product
                      </button>
                    </div>
                  </div>

                  {categories.length > 0 && (
                    <div className="dash-filters" role="tablist" aria-label="Filter products by category">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={filter === 'All'}
                        className={`dash-filter${filter === 'All' ? ' is-on' : ''}`}
                        onClick={() => setFilter('All')}
                      >
                        All<em>{products.length}</em>
                      </button>
                      {categories.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          role="tab"
                          aria-selected={filter === c.name}
                          className={`dash-filter${filter === c.name ? ' is-on' : ''}`}
                          onClick={() => setFilter(c.name)}
                        >
                          {c.imageDataUrl && <img src={c.imageDataUrl} alt="" />}
                          {c.name}
                          <em>{countInCategory(c.name)}</em>
                        </button>
                      ))}
                    </div>
                  )}

                  {productsLoading ? (
                    <div className="dash-cards">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="dash-card dash-card-ghost" />
                      ))}
                    </div>
                  ) : shown.length === 0 ? (
                    <div className="dash-blank dash-blank-slim">
                      <h3>Nothing in “{filter}” yet</h3>
                      <p>Products you file under this category will collect here.</p>
                      <div className="dash-blank-actions">
                        <button
                          type="button"
                          className="btn-solid"
                          onClick={() => setProductModal({ open: true, editing: null })}
                        >
                          Add a product
                        </button>
                        <button type="button" className="btn-quiet" onClick={() => setFilter('All')}>
                          Show all
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ul className="dash-cards">
                      {shown.map((p) => (
                        <li key={p.id} className="dash-card">
                          <button
                            type="button"
                            className="dash-card-photo"
                            aria-label={`Edit ${p.name}`}
                            onClick={() => setProductModal({ open: true, editing: p })}
                          >
                            {p.imageDataUrl ? (
                              <img src={p.imageDataUrl} alt="" />
                            ) : (
                              <span className="dash-card-noimg">
                                <Icon name="box" size={22} />
                              </span>
                            )}
                            {p.stock === 0 && <span className="dash-card-flag">Out of stock</span>}
                          </button>

                          <div className="dash-card-body">
                            <div className="dash-card-line">
                              <h3>{p.name}</h3>
                              <strong>{formatPrice(p.price)}</strong>
                            </div>
                            {p.category && <span className="dash-card-tag">{p.category}</span>}
                            {p.description && <p className="dash-card-desc">{p.description}</p>}
                          </div>

                          <div className="dash-card-foot">
                            <span className="dash-card-stock">
                              {p.stock === 0 ? 'None left' : `${p.stock} in stock`}
                            </span>
                            <span className="dash-card-tools">
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => setProductModal({ open: true, editing: p })}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="icon-btn icon-btn-danger"
                                onClick={() => {
                                  if (window.confirm(`Remove “${p.name}” from your shop?`)) void remove(p.id);
                                }}
                              >
                                Delete
                              </button>
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {/* Thumb-reachable on a phone, where the toolbar has scrolled away. */}
              <button
                type="button"
                className="dash-fab"
                aria-label="Add product"
                onClick={() => setProductModal({ open: true, editing: null })}
              >
                <span aria-hidden="true">+</span>
              </button>

              <ProductFormModal
                open={productModal.open}
                editing={productModal.editing}
                categories={categoryNames(categories)}
                onClose={() => setProductModal({ open: false, editing: null })}
                onSave={upsert}
                onAddCategory={addCategory}
              />
              <CategoriesModal
                open={categoriesOpen}
                categories={categories}
                usageCount={countInCategory}
                onClose={() => setCategoriesOpen(false)}
                onSave={saveCategories}
              />
              <StyleModal
                open={styleOpen}
                uiStyle={shop.uiStyle}
                onClose={() => setStyleOpen(false)}
                onChange={saveUiStyle}
              />
            </div>
          )}

          {view === 'settings' && (
            <div>
              <button type="button" className="dash-back-link" onClick={() => setView('overview')}>
                <Icon name="arrowRight" size={14} />
                Back to overview
              </button>
              <ShopSettingsForm shopProfile={userProfile.shopProfile} saveVendorShopProfile={saveVendorShopProfile} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const ShopSettingsForm: React.FC<{
  shopProfile: VendorShopProfile;
  saveVendorShopProfile: (p: VendorShopProfile) => Promise<boolean>;
}> = ({ shopProfile, saveVendorShopProfile }) => {
  const { showToast } = useToast();
  const [businessType, setBusinessType] = useState(shopProfile.businessType);
  const [shopName, setShopName] = useState(shopProfile.shopName);
  const [shopDescription, setShopDescription] = useState(shopProfile.shopDescription);
  const [city, setCity] = useState(shopProfile.city || '');
  const [whatsapp, setWhatsapp] = useState(shopProfile.whatsapp || '');
  const [contactEmail, setContactEmail] = useState(shopProfile.contactEmail || '');
  const [themeColor, setThemeColor] = useState(shopProfile.themeColor || DEFAULT_THEME_COLOR);
  // Kept apart from themeColor so a half-typed hex doesn't repaint the preview.
  const [hexDraft, setHexDraft] = useState(shopProfile.themeColor || DEFAULT_THEME_COLOR);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const pickColor = (hex: string) => {
    setThemeColor(hex);
    setHexDraft(hex);
    setSaved(false);
  };

  const canSave = shopName.trim() !== '' && shopDescription.trim() !== '';

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setSaved(false);
    try {
      // Spread the saved profile first: this form edits six text fields, and
      // without this the theme colour, logo and banner are dropped on save.
      const synced = await saveVendorShopProfile({
        ...shopProfile,
        businessType,
        shopName: shopName.trim(),
        shopDescription: shopDescription.trim(),
        city: city.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        themeColor,
      });
      setSaved(true);
      showToast(
        synced ? 'Shop settings saved' : 'Settings saved on this device — they will sync when the connection returns',
        synced ? 'success' : 'info'
      );
    } catch (err) {
      showToast('Failed to save shop settings. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--ink)' }}>Shop Settings</h2>
      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '1.5rem', maxWidth: 560 }}>
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={settingsLabelStyle} htmlFor="settings-businessType">Business Type</label>
          <select
            id="settings-businessType"
            style={settingsInputStyle}
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          >
            {BUSINESS_TYPES.map((bt) => <option key={bt.label} value={bt.label}>{bt.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '1.1rem' }}>
          <label style={settingsLabelStyle} htmlFor="settings-shopName">Shop Name</label>
          <input id="settings-shopName" style={settingsInputStyle} type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} />
        </div>

        <div style={{ marginBottom: '1.1rem' }}>
          <label style={settingsLabelStyle} htmlFor="settings-shopDescription">Shop Description</label>
          <textarea
            id="settings-shopDescription"
            style={{ ...settingsInputStyle, resize: 'vertical', minHeight: 90, fontFamily: 'inherit' }}
            maxLength={500}
            value={shopDescription}
            onChange={(e) => setShopDescription(e.target.value)}
          />
          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--faint)', marginTop: 4 }}>{shopDescription.length}/500</div>
        </div>

        <div style={{ marginBottom: '1.1rem' }}>
          <label style={settingsLabelStyle} htmlFor="settings-city">City / Location</label>
          <input id="settings-city" list="settings-city-suggestions" style={settingsInputStyle} type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          <datalist id="settings-city-suggestions">
            {CITY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>

        <div className="wizard-2col">
          <div>
            <label style={settingsLabelStyle} htmlFor="settings-whatsapp">WhatsApp Number</label>
            <input id="settings-whatsapp" style={settingsInputStyle} type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div>
            <label style={settingsLabelStyle} htmlFor="settings-contactEmail">Contact Email</label>
            <input id="settings-contactEmail" style={settingsInputStyle} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
        </div>

        {/* Theme colour — this is what paints the vendor's own storefront. */}
        <div className="settings-color">
          <label style={settingsLabelStyle}>Storefront Colour</label>
          <p className="settings-color-note">
            Used across the shop buyers see — the header, buttons and price accents.
          </p>

          <div className="settings-color-body">
            <ColorPicker value={themeColor} onChange={pickColor} />

            <div className="settings-color-side">
              <span className="settings-color-preview" style={{ background: themeColor }}>
                <Icon name="storefront" size={18} />
              </span>
              <input
                type="text"
                className="settings-hex"
                value={hexDraft}
                maxLength={7}
                spellCheck={false}
                aria-label="Hex colour code"
                onChange={(e) => {
                  const next = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                  setHexDraft(next);
                  if (isHexColor(next)) { setThemeColor(normalizeHex(next)); setSaved(false); }
                }}
                onBlur={() => setHexDraft(themeColor)}
              />
            </div>
          </div>

          <div className="wizard-color-presets" style={{ marginTop: 12 }}>
            {THEME_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                className={`wizard-preset-swatch${themeColor.toLowerCase() === c ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => pickColor(c)}
                aria-label={`Use ${c}`}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saving}
            style={{
              padding: '11px 24px', borderRadius: 10, border: 'none',
              background: canSave && !saving ? 'var(--ink)' : 'var(--line)',
              color: canSave && !saving ? '#fff' : 'var(--faint)',
              fontWeight: 700, fontSize: '0.88rem',
              cursor: canSave && !saving ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>✓ Saved</span>}
        </div>
      </div>
    </div>
  );
};

export default VendorOnboardingPage;

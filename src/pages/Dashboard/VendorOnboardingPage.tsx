import React, { useState } from 'react';
import { useAuth, type VendorShopProfile } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import VendorOnboardingWizard, { BUSINESS_TYPES, CITY_SUGGESTIONS } from './VendorOnboardingWizard';
import Logo from '../../components/Logo';
import UserMenu from '../../components/UserMenu';
import Icon, { type IconName } from '../../components/Icon';
import './Dashboard.css';

const ORDERS = [
  { id: '#VD-1024', cust: 'Priya Sharma',  product: 'Handwoven Basket', amount: '₹850',   status: 'Delivered' },
  { id: '#VD-1025', cust: 'Rahul Verma',   product: 'Ceramic Mug Set',  amount: '₹1,200', status: 'Processing' },
  { id: '#VD-1026', cust: 'Anita Desai',   product: 'Handwoven Basket', amount: '₹850',   status: 'Shipped' },
];

const settingsInputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid var(--line)', fontSize: '0.92rem', fontFamily: 'inherit',
  color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
};
const settingsLabelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6,
};

const VendorOnboardingPage: React.FC = () => {
  const { userProfile, logout, saveVendorShopProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings' | 'analytics'>('overview');

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

  const tabs: { id: string; label: string; icon: IconName }[] = [
    { id: 'overview',  label: 'Store Overview', icon: 'storefront' },
    { id: 'products',  label: 'My Products',    icon: 'box' },
    { id: 'orders',    label: 'Orders',         icon: 'cart' },
    { id: 'settings',  label: 'Shop Settings',  icon: 'gear' },
    { id: 'analytics', label: 'Analytics',      icon: 'chart' },
  ];

  const metrics: { label: string; value: string; sub: string; icon: IconName; iconBg: string; iconColor: string }[] = [
    { label: 'Products Listed', value: '12',      sub: '3 pending review', icon: 'box',     iconBg: 'var(--clay-soft)',    iconColor: 'var(--clay-deep)' },
    { label: 'Total Orders',    value: '48',      sub: '+6 this week',     icon: 'receipt', iconBg: 'var(--jade-soft)',    iconColor: 'var(--jade)' },
    { label: 'Total Revenue',   value: '₹18,400', sub: 'Last 30 days',     icon: 'coins',   iconBg: 'var(--saffron-soft)', iconColor: 'var(--saffron-deep)' },
    { label: 'Avg. Rating',     value: '4.8',     sub: '34 reviews',       icon: 'star',    iconBg: 'var(--paper-3)',      iconColor: 'var(--ink-2)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, var(--paper-2) 0%, var(--paper) 55%)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-brand">
          <Link to="/" className="dash-brand-link" aria-label="Vendora home">
            <Logo size={24} />
          </Link>
          <span className="dash-header-subtitle" style={{ fontSize: '0.8rem', color: 'var(--faint)', marginLeft: 6 }}>Vendor Dashboard</span>
        </div>
        <div className="dash-header-actions">
          <Link className="dash-ghost-btn" to="/my-shop">
            <Icon name="storefront" size={15} />
            View your site
          </Link>
          <UserMenu
            name={userProfile?.displayName || userProfile?.email?.split('@')[0] || 'Vendor'}
            email={userProfile?.email}
            roleLabel="Vendor"
            onLogout={handleLogout}
            viewSiteTo="/my-shop"
          />
        </div>
      </header>

      <div className="dash-layout">
        {/* Sidebar */}
        <aside className="dash-sidebar">
          <div className="vendor-sidebar-panel">
            <nav className="dash-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`vendor-nav-btn${activeTab === tab.id ? ' active' : ''}`}
                >
                  <Icon name={tab.icon} size={17} />
                  <span className="vendor-nav-label">{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="vendor-sidebar-tip">
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="sparkle" size={15} />
                Quick tip
              </div>
              <p style={{ fontSize: '0.78rem', lineHeight: 1.55, margin: 0 }}>
                Add high-quality photos to your product listings to increase sales by up to 3×.
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1 }}>
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--ink)' }}>
                Welcome, {userProfile?.displayName?.split(' ')[0] || 'Vendor'}
              </h2>

              {/* Metric cards */}
              <div className="dash-metric-grid">
                {metrics.map((m) => (
                  <div key={m.label} className="dash-metric-card">
                    <div className="dash-metric-top">
                      <div className="dash-metric-label">{m.label}</div>
                      <div className="dash-metric-icon" style={{ background: m.iconBg, color: m.iconColor }}>
                        <Icon name={m.icon} size={17} />
                      </div>
                    </div>
                    <div className="dash-metric-value">{m.value}</div>
                    <div className="dash-metric-sub">{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Recent orders + quick actions */}
              <div className="dash-overview-grid" style={{ marginBottom: '1.25rem' }}>
                <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: 'var(--ink)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>View All →</button>
                  </div>
                  {ORDERS.slice(0, 3).map((o, i) => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--paper-2)' : 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--paper-2)', color: 'var(--clay-deep)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="box" size={16} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.87rem' }}>{o.product}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--faint)' }}>{o.cust}</div>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, background: o.status === 'Delivered' ? 'var(--success-soft)' : o.status === 'Shipped' ? 'var(--jade-soft)' : 'var(--saffron-soft)', color: o.status === 'Delivered' ? 'var(--success)' : o.status === 'Shipped' ? 'var(--jade-deep)' : 'var(--saffron-deep)' }}>{o.status}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.9rem' }}>Quick Actions</h3>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <button onClick={() => setActiveTab('products')} className="vendor-quick-action"><Icon name="box" size={16} />Add product</button>
                    <button onClick={() => setActiveTab('settings')} className="vendor-quick-action"><Icon name="gear" size={16} />Shop settings</button>
                    <button onClick={() => setActiveTab('analytics')} className="vendor-quick-action"><Icon name="chart" size={16} />View analytics</button>
                  </div>
                </div>
              </div>

              {/* Setup checklist */}
              <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="check" size={17} />
                  Complete your store setup
                </h3>
                {[
                  { task: 'Add your store profile & photo',        done: true },
                  { task: 'List your first product',               done: true },
                  { task: 'Set up payment details',                done: false },
                  { task: 'Add shipping regions',                  done: false },
                  { task: 'Share your store link with customers',  done: false },
                ].map((item) => (
                  <div key={item.task} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--paper-2)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: item.done ? 'var(--success-soft)' : 'var(--paper-2)', border: `2px solid ${item.done ? '#22c55e' : 'var(--line)'}`, display: 'grid', placeItems: 'center', fontSize: '0.65rem', color: item.done ? 'var(--success)' : 'var(--faint)', fontWeight: 900 }}>
                      {item.done ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: item.done ? 'var(--faint)' : 'var(--ink-2)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink)' }}>My Products</h2>
                <button style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'var(--ink)', color: '#fff', fontWeight: 700, fontSize: '0.87rem', cursor: 'pointer' }}>+ Add Product</button>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
                <div className="dash-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
                      {['Product', 'Category', 'Price', 'Stock', 'Status'].map((h) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Handwoven Basket', cat: 'Handicrafts', price: '₹850', stock: 12, status: 'Active' },
                      { name: 'Ceramic Mug Set',  cat: 'Home Decor',  price: '₹1,200', stock: 5, status: 'Active' },
                      { name: 'Organic Turmeric', cat: 'Food',        price: '₹350', stock: 0, status: 'Out of stock' },
                    ].map((p) => (
                      <tr key={p.name} style={{ borderBottom: '1px solid var(--paper-2)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--ink)' }}>{p.name}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{p.cat}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--ink)' }}>{p.price}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{p.stock}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700, background: p.status === 'Active' ? 'var(--success-soft)' : 'var(--danger-soft)', color: p.status === 'Active' ? 'var(--success)' : 'var(--danger)' }}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--ink)' }}>Orders</h2>
              <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
                <div className="dash-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
                      {['Order ID', 'Customer', 'Product', 'Amount', 'Status'].map((h) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ORDERS.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--paper-2)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--ink)' }}>{o.id}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--ink-2)' }}>{o.cust}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{o.product}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--ink)' }}>{o.amount}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700, background: o.status === 'Delivered' ? 'var(--success-soft)' : o.status === 'Shipped' ? 'var(--jade-soft)' : 'var(--saffron-soft)', color: o.status === 'Delivered' ? 'var(--success)' : o.status === 'Shipped' ? 'var(--jade-deep)' : 'var(--saffron-deep)' }}>{o.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && <ShopSettingsForm shopProfile={userProfile.shopProfile} saveVendorShopProfile={saveVendorShopProfile} />}

          {activeTab === 'analytics' && (
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--ink)' }}>Analytics</h2>
              <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '1.5rem' }}>
                <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Store performance overview for this month.</p>
                <div className="dash-2col">
                  {[
                    { label: 'Store Views',     value: '1,842', icon: 'eye'      as IconName, bg: 'var(--clay-soft)',    badge: '#f0d3c8', text: 'var(--clay-deep)' },
                    { label: 'Product Clicks',  value: '634',   icon: 'cursor'   as IconName, bg: 'var(--jade-soft)',    badge: '#c6dfd2', text: 'var(--jade-deep)' },
                    { label: 'Conversion Rate', value: '7.6%',  icon: 'trending' as IconName, bg: 'var(--success-soft)', badge: '#c4e0cf', text: 'var(--success)' },
                    { label: 'Repeat Buyers',   value: '23',    icon: 'repeat'   as IconName, bg: 'var(--saffron-soft)', badge: '#f3ddb4', text: 'var(--saffron-deep)' },
                  ].map((a) => (
                    <div key={a.label} style={{ background: a.bg, borderRadius: 14, padding: '1.1rem', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ width: 40, height: 40, borderRadius: '50%', background: a.badge, color: a.text, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={a.icon} size={19} /></span>
                      <div>
                        <div style={{ fontSize: '0.76rem', color: a.text, opacity: .75, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>{a.label}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: a.text, lineHeight: 1.2 }}>{a.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const canSave = shopName.trim() !== '' && shopDescription.trim() !== '';

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setSaved(false);
    try {
      const synced = await saveVendorShopProfile({
        businessType,
        shopName: shopName.trim(),
        shopDescription: shopDescription.trim(),
        city: city.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
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

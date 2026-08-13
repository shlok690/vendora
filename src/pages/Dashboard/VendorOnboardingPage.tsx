import React, { useState } from 'react';
import { useAuth, type VendorShopProfile } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import VendorOnboardingWizard, { BUSINESS_TYPES, CITY_SUGGESTIONS } from './VendorOnboardingWizard';
import Logo from '../../components/Logo';
import './Dashboard.css';

const ORDERS = [
  { id: '#VD-1024', cust: 'Priya Sharma',  product: 'Handwoven Basket', amount: '₹850',   status: 'Delivered' },
  { id: '#VD-1025', cust: 'Rahul Verma',   product: 'Ceramic Mug Set',  amount: '₹1,200', status: 'Processing' },
  { id: '#VD-1026', cust: 'Anita Desai',   product: 'Handwoven Basket', amount: '₹850',   status: 'Shipped' },
];

const settingsInputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid #e2e8f0', fontSize: '0.92rem', fontFamily: 'inherit',
  color: '#0f172a', outline: 'none', boxSizing: 'border-box',
};
const settingsLabelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6,
};

const VendorOnboardingPage: React.FC = () => {
  const { userProfile, logout, saveVendorShopProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings' | 'analytics'>('overview');

  const handleLogout = async () => { await logout(); navigate('/login'); };

  if (!userProfile?.shopProfile) {
    return <VendorOnboardingWizard />;
  }

  const tabs = [
    { id: 'overview',  label: '🏪 Store Overview' },
    { id: 'products',  label: '📦 My Products' },
    { id: 'orders',    label: '🛒 Orders' },
    { id: 'settings',  label: '⚙️ Shop Settings' },
    { id: 'analytics', label: '📊 Analytics' },
  ];

  const metrics = [
    { label: 'Products Listed', value: '12',       sub: '3 pending review', icon: '📦', iconBg: '#dbeafe' },
    { label: 'Total Orders',    value: '48',        sub: '+6 this week',     icon: '🧾', iconBg: '#dcfce7' },
    { label: 'Total Revenue',   value: '₹18,400',   sub: 'Last 30 days',     icon: '💰', iconBg: '#ede9fe' },
    { label: 'Avg. Rating',     value: '4.8',        sub: '34 reviews',      icon: '⭐', iconBg: '#fef3c7' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #eef0f8 0%, #f8fafc 55%)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-brand">
          <Logo size={24} />
          <span className="dash-header-subtitle" style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 6 }}>Vendor Dashboard</span>
        </div>
        <div className="dash-header-actions">
          <span className="dash-header-username" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>{userProfile?.displayName || userProfile?.email}</span>
          <span style={{ fontSize: '0.72rem', background: '#eef0f8', color: '#2b2f4d', border: '1px solid #d8dbee', padding: '3px 10px', borderRadius: 9999, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Vendor</span>
          <button onClick={() => navigate('/')} style={{ padding: '7px 14px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>🌐 Main Site</button>
          <button onClick={handleLogout} style={{ padding: '7px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>Logout</button>
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
                >{tab.label}</button>
              ))}
            </nav>

            <div className="vendor-sidebar-tip">
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>Quick Tip 💡</div>
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
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>
                Welcome back, {userProfile?.displayName?.split(' ')[0] || 'Vendor'} 👋
              </h2>

              {/* Metric cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                {metrics.map((m) => (
                  <div key={m.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem', boxShadow: '0 1px 3px rgba(15,23,42,.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{m.label}</div>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.iconBg, display: 'grid', placeItems: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{m.icon}</div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, marginTop: 10 }}>{m.value}</div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 6 }}>{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Recent orders + quick actions */}
              <div className="dash-overview-grid" style={{ marginBottom: '1.25rem' }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: '#2b2f4d', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>View All →</button>
                  </div>
                  {ORDERS.slice(0, 3).map((o, i) => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ fontSize: '1.3rem' }}>📦</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.87rem' }}>{o.product}</div>
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{o.cust}</div>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, background: o.status === 'Delivered' ? '#dcfce7' : o.status === 'Shipped' ? '#dbeafe' : '#fef9c3', color: o.status === 'Delivered' ? '#16a34a' : o.status === 'Shipped' ? '#2563eb' : '#92400e' }}>{o.status}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.9rem' }}>Quick Actions</h3>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <button onClick={() => setActiveTab('products')} className="vendor-quick-action">+ Add Product</button>
                    <button onClick={() => setActiveTab('settings')} className="vendor-quick-action">⚙️ Shop Settings</button>
                    <button onClick={() => setActiveTab('analytics')} className="vendor-quick-action">📊 View Analytics</button>
                  </div>
                </div>
              </div>

              {/* Setup checklist */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>🚀 Complete your store setup</h3>
                {[
                  { task: 'Add your store profile & photo',        done: true },
                  { task: 'List your first product',               done: true },
                  { task: 'Set up payment details',                done: false },
                  { task: 'Add shipping regions',                  done: false },
                  { task: 'Share your store link with customers',  done: false },
                ].map((item) => (
                  <div key={item.task} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: item.done ? '#dcfce7' : '#f1f5f9', border: `2px solid ${item.done ? '#22c55e' : '#e2e8f0'}`, display: 'grid', placeItems: 'center', fontSize: '0.65rem', color: item.done ? '#16a34a' : '#94a3b8', fontWeight: 900 }}>
                      {item.done ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: item.done ? '#94a3b8' : '#334155', textDecoration: item.done ? 'line-through' : 'none' }}>{item.task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>My Products</h2>
                <button style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: '#2b2f4d', color: '#fff', fontWeight: 700, fontSize: '0.87rem', cursor: 'pointer' }}>+ Add Product</button>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
                <div className="dash-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {['Product', 'Category', 'Price', 'Stock', 'Status'].map((h) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Handwoven Basket', cat: 'Handicrafts', price: '₹850', stock: 12, status: 'Active' },
                      { name: 'Ceramic Mug Set',  cat: 'Home Decor',  price: '₹1,200', stock: 5, status: 'Active' },
                      { name: 'Organic Turmeric', cat: 'Food',        price: '₹350', stock: 0, status: 'Out of stock' },
                    ].map((p) => (
                      <tr key={p.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{p.name}</td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>{p.cat}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{p.price}</td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>{p.stock}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700, background: p.status === 'Active' ? '#dcfce7' : '#fef2f2', color: p.status === 'Active' ? '#16a34a' : '#dc2626' }}>{p.status}</span>
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
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Orders</h2>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
                <div className="dash-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {['Order ID', 'Customer', 'Product', 'Amount', 'Status'].map((h) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ORDERS.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#2b2f4d' }}>{o.id}</td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>{o.cust}</td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>{o.product}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{o.amount}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700, background: o.status === 'Delivered' ? '#dcfce7' : o.status === 'Shipped' ? '#dbeafe' : '#fef9c3', color: o.status === 'Delivered' ? '#16a34a' : o.status === 'Shipped' ? '#2563eb' : '#92400e' }}>{o.status}</span>
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
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Analytics</h2>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem' }}>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>Store performance overview for this month.</p>
                <div className="dash-2col">
                  {[
                    { label: 'Store Views',     value: '1,842', icon: '👁️', bg: '#ede9fe', badge: '#ddd6fe', text: '#6d28d9' },
                    { label: 'Product Clicks',  value: '634',   icon: '🖱️', bg: '#dbeafe', badge: '#bfdbfe', text: '#1d4ed8' },
                    { label: 'Conversion Rate', value: '7.6%',  icon: '📈', bg: '#dcfce7', badge: '#bbf7d0', text: '#15803d' },
                    { label: 'Repeat Buyers',   value: '23',    icon: '🔄', bg: '#fef3c7', badge: '#fde68a', text: '#b45309' },
                  ].map((a) => (
                    <div key={a.label} style={{ background: a.bg, borderRadius: 14, padding: '1.1rem', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ width: 40, height: 40, borderRadius: '50%', background: a.badge, display: 'grid', placeItems: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{a.icon}</span>
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
  saveVendorShopProfile: (p: VendorShopProfile) => Promise<void>;
}> = ({ shopProfile, saveVendorShopProfile }) => {
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
      await saveVendorShopProfile({
        businessType,
        shopName: shopName.trim(),
        shopDescription: shopDescription.trim(),
        city: city.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Shop Settings</h2>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', maxWidth: 560 }}>
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={settingsLabelStyle} htmlFor="settings-businessType">Business Type</label>
          <select
            id="settings-businessType"
            style={settingsInputStyle}
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          >
            {BUSINESS_TYPES.map((bt) => <option key={bt.label} value={bt.label}>{bt.icon} {bt.label}</option>)}
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
          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>{shopDescription.length}/500</div>
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
              background: canSave && !saving ? '#2b2f4d' : '#e2e8f0',
              color: canSave && !saving ? '#fff' : '#94a3b8',
              fontWeight: 700, fontSize: '0.88rem',
              cursor: canSave && !saving ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>✓ Saved</span>}
        </div>
      </div>
    </div>
  );
};

export default VendorOnboardingPage;

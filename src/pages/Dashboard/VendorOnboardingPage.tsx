import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import VendorOnboardingWizard from './VendorOnboardingWizard';
import Logo from '../../components/Logo';
import './Dashboard.css';

const VendorOnboardingPage: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics'>('overview');

  const handleLogout = async () => { await logout(); navigate('/login'); };

  if (!userProfile?.shopProfile) {
    return <VendorOnboardingWizard />;
  }

  const tabs = [
    { id: 'overview',  label: '🏪 Store Overview' },
    { id: 'products',  label: '📦 My Products' },
    { id: 'orders',    label: '🛒 Orders' },
    { id: 'analytics', label: '📊 Analytics' },
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
          <nav className="dash-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  textAlign: 'left', padding: '10px 14px', borderRadius: 10, border: 'none',
                  background: activeTab === tab.id ? '#eef0f8' : 'transparent',
                  color: activeTab === tab.id ? '#2b2f4d' : '#64748b',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  borderLeft: activeTab === tab.id ? '3px solid #2b2f4d' : '3px solid transparent',
                  cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit', transition: 'all .15s',
                }}
              >{tab.label}</button>
            ))}
          </nav>

          <div style={{ marginTop: '2.5rem', padding: '1.1rem', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>Quick Tip 💡</div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
              Add high-quality photos to your product listings to increase sales by up to 3×.
            </p>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                {[
                  { label: 'Products Listed', value: '12', sub: '3 pending review', color: '#2563eb' },
                  { label: 'Total Orders',     value: '48', sub: '+6 this week',      color: '#16a34a' },
                  { label: 'Total Revenue',    value: '₹18,400', sub: 'Last 30 days', color: '#7c3aed' },
                  { label: 'Avg. Rating',      value: '4.8 ⭐', sub: '34 reviews',   color: '#d97706' },
                ].map((m) => (
                  <div key={m.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem', boxShadow: '0 1px 3px rgba(15,23,42,.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{m.label}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: m.color, lineHeight: 1.1 }}>{m.value}</div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 6 }}>{m.sub}</div>
                  </div>
                ))}
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
                    {[
                      { id: '#VD-1024', cust: 'Priya Sharma',  product: 'Handwoven Basket', amount: '₹850',   status: 'Delivered' },
                      { id: '#VD-1025', cust: 'Rahul Verma',   product: 'Ceramic Mug Set',  amount: '₹1,200', status: 'Processing' },
                      { id: '#VD-1026', cust: 'Anita Desai',   product: 'Handwoven Basket', amount: '₹850',   status: 'Shipped' },
                    ].map((o) => (
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

          {activeTab === 'analytics' && (
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Analytics</h2>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem' }}>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>Store performance overview for this month.</p>
                <div className="dash-2col">
                  {[
                    { label: 'Store Views',     value: '1,842', icon: '👁️' },
                    { label: 'Product Clicks',  value: '634',   icon: '🖱️' },
                    { label: 'Conversion Rate', value: '7.6%',  icon: '📈' },
                    { label: 'Repeat Buyers',   value: '23',    icon: '🔄' },
                  ].map((a) => (
                    <div key={a.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.1rem', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{a.label}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>{a.value}</div>
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

export default VendorOnboardingPage;

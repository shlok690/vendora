import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomerExplorePage: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'explore' | 'orders' | 'wishlist' | 'account'>('explore');

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const tabs = [
    { id: 'explore',  label: '🛍️ Explore' },
    { id: 'orders',   label: '📦 My Orders' },
    { id: 'wishlist', label: '❤️ Wishlist' },
    { id: 'account',  label: '👤 Account' },
  ];

  const products = [
    { name: 'Handwoven Basket',   vendor: 'Riya Crafts',      price: '₹850',   rating: '4.9', tag: 'Handicrafts', emoji: '🧺' },
    { name: 'Ceramic Mug Set',    vendor: 'Pottery House',    price: '₹1,200', rating: '4.8', tag: 'Home Decor',  emoji: '🫖' },
    { name: 'Organic Turmeric',   vendor: 'Spice Trail',      price: '₹350',   rating: '4.6', tag: 'Food',        emoji: '🌿' },
    { name: 'Linen Kurta',        vendor: 'Weavers Hub',      price: '₹1,800', rating: '4.7', tag: 'Clothing',    emoji: '👕' },
    { name: 'Bamboo Lamp',        vendor: 'EcoLight Co.',     price: '₹2,200', rating: '4.5', tag: 'Furniture',   emoji: '🪔' },
    { name: 'Silver Earrings',    vendor: 'GoldSmith Works',  price: '₹950',   rating: '4.8', tag: 'Jewellery',   emoji: '✨' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #eef0f8 0%, #f8fafc 55%)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '88px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/vendora-logo.jpg" alt="Vendora" style={{ height: 64, width: 'auto' }} />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 6 }}>Marketplace</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>{userProfile?.displayName || userProfile?.email}</span>
          <span style={{ fontSize: '0.72rem', background: '#eef0f8', color: '#2b2f4d', border: '1px solid #d8dbee', padding: '3px 10px', borderRadius: 9999, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Customer</span>
          <button onClick={() => navigate('/')} style={{ padding: '7px 14px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>🌐 Main Site</button>
          <button onClick={handleLogout} style={{ padding: '7px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem', gap: '1.75rem' }}>
        {/* Sidebar */}
        <aside style={{ width: 220, flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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

          {/* Category filter */}
          <div style={{ marginTop: '1.5rem', padding: '1.1rem', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Categories</div>
            {['All', 'Handicrafts', 'Clothing', 'Food', 'Home Decor', 'Jewellery', 'Electronics'].map((cat) => (
              <div key={cat} style={{ padding: '6px 8px', borderRadius: 8, cursor: 'pointer', fontSize: '0.84rem', color: cat === 'All' ? '#2b2f4d' : '#64748b', fontWeight: cat === 'All' ? 700 : 500, background: cat === 'All' ? '#eef0f8' : 'transparent', marginBottom: 2 }}>
                {cat}
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1 }}>
          {activeTab === 'explore' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  Hello, {userProfile?.displayName?.split(' ')[0] || 'there'} 👋 Explore products
                </h2>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: '#94a3b8' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search products or vendors…"
                  style={{ width: '100%', padding: '11px 14px 11px 40px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: '0.92rem', fontFamily: 'inherit', background: '#fff', color: '#0f172a', outline: 'none' }}
                />
              </div>

              {/* Products grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
                {products.map((p) => (
                  <div key={p.name} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,23,42,.05)', transition: 'transform .2s, box-shadow .2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 30px rgba(15,23,42,.10)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(15,23,42,.05)'; }}
                  >
                    {/* Product image placeholder */}
                    <div style={{ height: 130, background: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', display: 'grid', placeItems: 'center', fontSize: '2.8rem' }}>
                      {p.emoji}
                    </div>
                    <div style={{ padding: '14px' }}>
                      <div style={{ fontSize: '0.68rem', background: '#eef0f8', color: '#2b2f4d', border: '1px solid #d8dbee', display: 'inline-block', padding: '2px 8px', borderRadius: 9999, fontWeight: 700, marginBottom: 6 }}>{p.tag}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b', marginBottom: 3 }}>{p.name}</div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: 8 }}>by {p.vendor}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>{p.price}</span>
                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>⭐ {p.rating}</span>
                      </div>
                      <button style={{ width: '100%', marginTop: 10, padding: '8px', borderRadius: 8, border: 'none', background: '#2b2f4d', color: '#fff', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Add to Cart 🛒
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>My Orders</h2>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
                {[
                  { id: '#VD-0891', product: 'Handwoven Basket', vendor: 'Riya Crafts', amount: '₹850', status: 'Delivered', date: '2 Aug 2026' },
                  { id: '#VD-0902', product: 'Linen Kurta',      vendor: 'Weavers Hub', amount: '₹1,800', status: 'Shipped',   date: '5 Aug 2026' },
                ].map((o, i) => (
                  <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '1rem 1.25rem', borderBottom: i < 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ fontSize: '1.6rem' }}>📦</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{o.product}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{o.vendor} · {o.date}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{o.amount}</div>
                    <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700, background: o.status === 'Delivered' ? '#dcfce7' : '#dbeafe', color: o.status === 'Delivered' ? '#16a34a' : '#2563eb' }}>{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>My Wishlist ❤️</h2>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💝</div>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Your wishlist is empty. Explore products and save your favourites!</p>
                <button onClick={() => setActiveTab('explore')} style={{ marginTop: '1.25rem', padding: '10px 22px', borderRadius: 10, border: 'none', background: '#2b2f4d', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>Explore Products</button>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Account</h2>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.5rem' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: '#2b2f4d', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 900 }}>
                    {(userProfile?.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{userProfile?.displayName || 'Customer'}</div>
                    <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>{userProfile?.email}</div>
                    <div style={{ fontSize: '0.72rem', background: '#eef0f8', color: '#2b2f4d', border: '1px solid #d8dbee', display: 'inline-block', padding: '2px 10px', borderRadius: 9999, fontWeight: 700, marginTop: 4 }}>CUSTOMER</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                  {['Edit Profile', 'Saved Addresses', 'Payment Methods', 'Notifications'].map((item) => (
                    <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}>
                      <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>{item}</span>
                      <span style={{ color: '#94a3b8' }}>›</span>
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

export default CustomerExplorePage;

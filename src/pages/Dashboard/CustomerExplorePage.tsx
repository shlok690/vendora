import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import './Dashboard.css';

const CustomerExplorePage: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'explore' | 'orders' | 'wishlist' | 'account'>('explore');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'info');
      navigate('/login');
    } catch (err) {
      showToast('Failed to log out. Please try again.', 'error');
    }
  };

  const tabs = [
    { id: 'explore',  label: '🛍️ Explore' },
    { id: 'orders',   label: '📦 My Orders' },
    { id: 'wishlist', label: '❤️ Wishlist' },
    { id: 'account',  label: '👤 Account' },
  ];

  const products = [
    { name: 'Handwoven Basket',   vendor: 'Riya Crafts',      price: '₹850',   rating: '4.9', tag: 'Handicrafts', image: 'https://images.unsplash.com/photo-1601330862030-1e08c703ac04?auto=format&fit=crop&w=400&q=80' },
    { name: 'Ceramic Mug Set',    vendor: 'Pottery House',    price: '₹1,200', rating: '4.8', tag: 'Home Decor',  image: 'https://images.unsplash.com/photo-1616241673111-508b4662c707?auto=format&fit=crop&w=400&q=80' },
    { name: 'Organic Turmeric',   vendor: 'Spice Trail',      price: '₹350',   rating: '4.6', tag: 'Food',        image: 'https://images.unsplash.com/photo-1768729341078-9da4e0ea959e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Linen Kurta',        vendor: 'Weavers Hub',      price: '₹1,800', rating: '4.7', tag: 'Clothing',    image: 'https://images.unsplash.com/photo-1727835523545-70ee992b5763?auto=format&fit=crop&w=400&q=80' },
    { name: 'Bamboo Lamp',        vendor: 'EcoLight Co.',     price: '₹2,200', rating: '4.5', tag: 'Furniture',   image: 'https://images.unsplash.com/photo-1578678809569-1a8ead9cb802?auto=format&fit=crop&w=400&q=80' },
    { name: 'Silver Earrings',    vendor: 'GoldSmith Works',  price: '₹950',   rating: '4.8', tag: 'Jewellery',   image: 'https://images.unsplash.com/photo-1693212793204-bcea856c75fe?auto=format&fit=crop&w=400&q=80' },
  ];

  const categories = ['All', 'Handicrafts', 'Clothing', 'Food', 'Home Decor', 'Jewellery', 'Electronics'];
  const filteredProducts = selectedCategory === 'All' ? products : products.filter((p) => p.tag === selectedCategory);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setActiveTab('explore');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #eef0f8 0%, #f8fafc 55%)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-brand">
          <Logo size={24} />
          <span className="dash-header-subtitle" style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 6 }}>Marketplace</span>
        </div>
        <div className="dash-header-actions">
          <span className="dash-header-username" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>{userProfile?.displayName || userProfile?.email}</span>
          <span style={{ fontSize: '0.72rem', background: '#eef0f8', color: '#2b2f4d', border: '1px solid #d8dbee', padding: '3px 10px', borderRadius: 9999, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Customer</span>
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

          {/* Category filter */}
          <div style={{ marginTop: '1.5rem', padding: '1.1rem', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Categories</div>
            {categories.map((cat) => {
              const active = cat === selectedCategory;
              return (
                <div
                  key={cat}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectCategory(cat)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectCategory(cat); }}
                  style={{
                    padding: '6px 8px', borderRadius: 8, cursor: 'pointer', fontSize: '0.84rem',
                    color: active ? '#2b2f4d' : '#64748b', fontWeight: active ? 700 : 500,
                    background: active ? '#eef0f8' : 'transparent', marginBottom: 2, transition: 'background .15s, color .15s',
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  {cat}
                </div>
              );
            })}
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
                {selectedCategory !== 'All' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#64748b' }}>
                    Filtering: <span style={{ background: '#eef0f8', color: '#2b2f4d', border: '1px solid #d8dbee', padding: '3px 10px', borderRadius: 9999, fontWeight: 700 }}>{selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('All')} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline', fontFamily: 'inherit' }}>Clear</button>
                  </div>
                )}
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
              {filteredProducts.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '2.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>No products in "{selectedCategory}" yet.</p>
                  <button onClick={() => setSelectedCategory('All')} style={{ marginTop: '1.1rem', padding: '9px 20px', borderRadius: 10, border: 'none', background: '#2b2f4d', color: '#fff', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer', fontFamily: 'inherit' }}>View All Products</button>
                </div>
              ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
                {filteredProducts.map((p) => (
                  <div key={p.name} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,23,42,.05)', transition: 'transform .2s, box-shadow .2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 30px rgba(15,23,42,.10)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(15,23,42,.05)'; }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', background: '#f1f5f9' }}
                    />
                    <div style={{ padding: '14px' }}>
                      <div style={{ fontSize: '0.68rem', background: '#eef0f8', color: '#2b2f4d', border: '1px solid #d8dbee', display: 'inline-block', padding: '2px 8px', borderRadius: 9999, fontWeight: 700, marginBottom: 6 }}>{p.tag}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b', marginBottom: 3 }}>{p.name}</div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: 8 }}>by {p.vendor}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>{p.price}</span>
                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>⭐ {p.rating}</span>
                      </div>
                      <button
                        onClick={() => showToast(`Added "${p.name}" to cart`, 'success')}
                        style={{ width: '100%', marginTop: 10, padding: '8px', borderRadius: 8, border: 'none', background: '#2b2f4d', color: '#fff', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Add to Cart 🛒
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )}
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
                    <div style={{ flex: 1, minWidth: 0 }}>
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

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import Icon, { type IconName } from '../../components/Icon';
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
    { id: 'explore',  label: 'Explore',   icon: 'compass' as IconName },
    { id: 'orders',   label: 'My Orders', icon: 'box' as IconName },
    { id: 'wishlist', label: 'Wishlist',  icon: 'star' as IconName },
    { id: 'account',  label: 'Account',   icon: 'users' as IconName },
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, var(--paper-2) 0%, var(--paper) 55%)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-brand">
          <Logo size={24} />
          <span className="dash-header-subtitle" style={{ fontSize: '0.8rem', color: 'var(--faint)', marginLeft: 6 }}>Marketplace</span>
        </div>
        <div className="dash-header-actions">
          <span className="dash-header-username" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink-2)' }}>{userProfile?.displayName || userProfile?.email}</span>
          <span style={{ fontSize: '0.72rem', background: 'var(--paper-2)', color: 'var(--ink)', border: '1px solid var(--line-2)', padding: '3px 10px', borderRadius: 9999, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Customer</span>
          <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, background: 'var(--paper-2)', border: '1px solid var(--line)', color: 'var(--ink-2)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}><Icon name="storefront" size={15} />Main site</button>
          <button onClick={handleLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, background: 'var(--danger-soft)', border: '1px solid #f0cec5', color: 'var(--danger)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}><Icon name="logout" size={15} />Logout</button>
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
                  display: 'flex', alignItems: 'center', gap: 10,
                  textAlign: 'left', padding: '10px 14px', borderRadius: 10, border: 'none',
                  background: activeTab === tab.id ? 'var(--paper-2)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--ink)' : 'var(--muted)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  borderLeft: activeTab === tab.id ? '3px solid var(--clay)' : '3px solid transparent',
                  cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit', transition: 'all .15s',
                }}
              >
                <Icon name={tab.icon} size={17} />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Category filter */}
          <div style={{ marginTop: '1.5rem', padding: '1.1rem', borderRadius: 12, background: '#fff', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Categories</div>
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
                    color: active ? 'var(--ink)' : 'var(--muted)', fontWeight: active ? 700 : 500,
                    background: active ? 'var(--paper-2)' : 'transparent', marginBottom: 2, transition: 'background .15s, color .15s',
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'var(--paper)'; }}
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
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink)' }}>
                  Hello, {userProfile?.displayName?.split(' ')[0] || 'there'} — explore products
                </h2>
                {selectedCategory !== 'All' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--muted)' }}>
                    Filtering: <span style={{ background: 'var(--paper-2)', color: 'var(--ink)', border: '1px solid var(--line-2)', padding: '3px 10px', borderRadius: 9999, fontWeight: 700 }}>{selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('All')} style={{ border: 'none', background: 'none', color: 'var(--faint)', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline', fontFamily: 'inherit' }}>Clear</button>
                  </div>
                )}
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <Icon name="search" size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search products or vendors…"
                  style={{ width: '100%', padding: '11px 14px 11px 40px', border: '1.5px solid var(--line)', borderRadius: 12, fontSize: '0.92rem', fontFamily: 'inherit', background: '#fff', color: 'var(--ink)', outline: 'none' }}
                />
              </div>

              {/* Products grid */}
              {filteredProducts.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '2.5rem', textAlign: 'center' }}>
                  <Icon name="search" size={34} strokeWidth={1.3} style={{ color: 'var(--line-2)', marginBottom: '0.75rem' }} />
                  <p style={{ color: 'var(--faint)', fontSize: '0.95rem' }}>No products in "{selectedCategory}" yet.</p>
                  <button onClick={() => setSelectedCategory('All')} style={{ marginTop: '1.1rem', padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--ink)', color: '#fff', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer', fontFamily: 'inherit' }}>View All Products</button>
                </div>
              ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
                {filteredProducts.map((p) => (
                  <div key={p.name} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,23,42,.05)', transition: 'transform .2s, box-shadow .2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 30px rgba(15,23,42,.10)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(15,23,42,.05)'; }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', background: 'var(--paper-2)' }}
                    />
                    <div style={{ padding: '14px' }}>
                      <div style={{ fontSize: '0.68rem', background: 'var(--paper-2)', color: 'var(--ink)', border: '1px solid var(--line-2)', display: 'inline-block', padding: '2px 8px', borderRadius: 9999, fontWeight: 700, marginBottom: 6 }}>{p.tag}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)', marginBottom: 3 }}>{p.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--faint)', marginBottom: 8 }}>by {p.vendor}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--ink)' }}>{p.price}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', color: 'var(--ink-2)', fontWeight: 500 }}><Icon name="star" size={13} strokeWidth={1.9} style={{ color: 'var(--saffron)', fill: 'var(--saffron)' }} />{p.rating}</span>
                      </div>
                      <button
                        onClick={() => showToast(`Added "${p.name}" to cart`, 'success')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', marginTop: 10, padding: '9px', borderRadius: 999, border: 'none', background: 'var(--ink)', color: '#fff', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        <Icon name="cart" size={15} />
                        Add to cart
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
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--ink)' }}>My Orders</h2>
              <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
                {[
                  { id: '#VD-0891', product: 'Handwoven Basket', vendor: 'Riya Crafts', amount: '₹850', status: 'Delivered', date: '2 Aug 2026' },
                  { id: '#VD-0902', product: 'Linen Kurta',      vendor: 'Weavers Hub', amount: '₹1,800', status: 'Shipped',   date: '5 Aug 2026' },
                ].map((o, i) => (
                  <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '1rem 1.25rem', borderBottom: i < 1 ? '1px solid var(--paper-2)' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--paper-2)', color: 'var(--clay-deep)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="box" size={19} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.9rem' }}>{o.product}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--faint)' }}>{o.vendor} · {o.date}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--ink)' }}>{o.amount}</div>
                    <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700, background: o.status === 'Delivered' ? 'var(--success-soft)' : 'var(--jade-soft)', color: o.status === 'Delivered' ? 'var(--success)' : 'var(--jade-deep)' }}>{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--ink)' }}>My Wishlist</h2>
              <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💝</div>
                <p style={{ color: 'var(--faint)', fontSize: '0.95rem' }}>Your wishlist is empty. Explore products and save your favourites!</p>
                <button onClick={() => setActiveTab('explore')} style={{ marginTop: '1.25rem', padding: '10px 22px', borderRadius: 10, border: 'none', background: 'var(--ink)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>Explore Products</button>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--ink)' }}>Account</h2>
              <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.5rem' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--ink)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 900 }}>
                    {(userProfile?.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--ink)' }}>{userProfile?.displayName || 'Customer'}</div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--faint)' }}>{userProfile?.email}</div>
                    <div style={{ fontSize: '0.72rem', background: 'var(--paper-2)', color: 'var(--ink)', border: '1px solid var(--line-2)', display: 'inline-block', padding: '2px 10px', borderRadius: 9999, fontWeight: 700, marginTop: 4 }}>CUSTOMER</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '0.75rem', borderTop: '1px solid var(--paper-2)', paddingTop: '1.25rem' }}>
                  {['Edit Profile', 'Saved Addresses', 'Payment Methods', 'Notifications'].map((item) => (
                    <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--paper)', cursor: 'pointer' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--ink-2)', fontWeight: 500 }}>{item}</span>
                      <span style={{ color: 'var(--faint)' }}>›</span>
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

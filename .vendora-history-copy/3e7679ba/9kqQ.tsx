import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomerExplorePage: React.FC = () => {
  const { userProfile, logout, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020617 0%, #111827 100%)',
        color: '#f8fafc',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Customer Welcome</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#94a3b8' }}>
            Hello, {userProfile?.displayName || 'Customer'} — explore products from local vendors.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: '#2563eb',
              border: '1px solid #1d4ed8',
              color: '#ffffff',
              padding: '0.8rem 1.1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Main Page
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: '#1f2937',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#f8fafc',
              padding: '0.8rem 1.1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <section
          style={{
            padding: '2rem',
            background: '#111827',
            borderRadius: '24px',
            boxShadow: '0 30px 80px rgba(15, 23, 42, 0.35)',
          }}
        >
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: 800 }}>Explore Products</h2>
              <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.8 }}>
                Browse curated vendor shops, discover new products, and place orders easily.
                This page is your customer marketplace home.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              {[
                { title: 'Featured Shops', description: 'See the top vendors and their best selling products.' },
                { title: 'Categories', description: 'Browse items by popular categories like fashion, crafts, and furniture.' },
                { title: 'New Arrivals', description: 'Find just-added stock from local sellers.' },
                { title: 'Special Offers', description: 'Discover promotions and limited-time discounts.' },
              ].map((card) => (
                <div
                  key={card.title}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '20px',
                    background: '#1f2937',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{card.title}</h3>
                  <p style={{ margin: '0.75rem 0 0', color: '#94a3b8', lineHeight: 1.7 }}>{card.description}</p>
                </div>
              ))}
            </div>

            <div style={{ padding: '1.5rem', borderRadius: '20px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 700 }}>Next step</h3>
              <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.8 }}>
                Start by viewing featured shops or search directly for products that fit your needs.
                When you're ready, add items to cart and checkout in just a few clicks.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerExplorePage;

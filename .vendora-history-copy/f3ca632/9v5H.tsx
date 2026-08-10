import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VendorOnboardingPage: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #111827 100%)',
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
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Vendor Onboarding</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#94a3b8' }}>
            Welcome, {userProfile?.displayName || 'Vendor'} — set up your store and start selling.
          </p>
        </div>
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
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: 800 }}>Start your vendor journey</h2>
              <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.8 }}>
                Fill your vendor profile, add products, and get discovered by customers.
                Your vendor dashboard gives you full control over listings, orders, and payments.
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
                { title: 'Seller Profile', description: 'Set your store name, description and contact details.' },
                { title: 'Upload Products', description: 'Add product images, pricing, and stock availability.' },
                { title: 'Shipping Settings', description: 'Set shipping regions, fees, and delivery timelines.' },
                { title: 'Analytics', description: 'Track store visits, orders and sales performance.' },
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
                To complete onboarding, add your first product listing and publish your shop.
                Customers will then be able to browse your catalog and place orders.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VendorOnboardingPage;

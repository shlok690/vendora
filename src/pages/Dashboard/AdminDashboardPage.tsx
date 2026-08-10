import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #eef0f8 0%, #f8fafc 55%)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '88px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/vendora-logo.jpg" alt="Vendora" style={{ height: 64, width: 'auto' }} />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 6 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>{userProfile?.displayName || userProfile?.email}</span>
          <span style={{ fontSize: '0.72rem', background: '#eef0f8', color: '#2b2f4d', border: '1px solid #d8dbee', padding: '3px 10px', borderRadius: 9999, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Admin</span>
          <button onClick={() => navigate('/')} style={{ padding: '7px 14px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>🌐 Main Site</button>
          <button onClick={handleLogout} style={{ padding: '7px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>Logout 🚪</button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Admin Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>This will be the Vendora admin console — placeholder for now.</p>
      </main>
    </div>
  );
};

export default AdminDashboardPage;

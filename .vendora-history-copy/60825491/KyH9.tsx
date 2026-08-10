import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserDashboardPage: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'notices' | 'bills' | 'visitors' | 'amenities'>('notices');
  const [visitorName, setVisitorName] = useState('');
  const [generatedPassCode, setGeneratedPassCode] = useState<string | null>(null);

  const [notices] = useState([
    { id: 1, title: 'Annual General Body Meeting', date: '2026-08-05', body: 'AGM scheduled at Society Clubhouse at 10 AM.' },
    { id: 2, title: 'Water Tank Cleaning Notice', date: '2026-07-30', body: 'Water supply will be paused from 10 AM to 2 PM.' },
    { id: 3, title: 'Clubhouse Swimming Pool Timings', date: '2026-07-25', body: 'Morning 6:00 AM - 10:00 AM | Evening 4:00 PM - 9:00 PM.' },
  ]);

  const [bills, setBills] = useState([
    { id: 'JUL2026', month: 'July 2026 Maintenance', amount: 250, dueDate: '2026-08-05', status: 'UNPAID' },
    { id: 'JUN2026', month: 'June 2026 Maintenance', amount: 250, dueDate: '2026-07-05', status: 'PAID' },
  ]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleGeneratePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName) return;
    const randomCode = 'GATE-' + Math.floor(1000 + Math.random() * 9000);
    setGeneratedPassCode(randomCode);
  };

  const handlePayBill = (billId: string) => {
    setBills(bills.map((b) => (b.id === billId ? { ...b, status: 'PAID' } : b)));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top Navigation */}
      <header style={{ borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a90', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)' }}>
            🏡
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Resident Portal
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Society Member Hub</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block' }}>{userProfile?.displayName || userProfile?.email}</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', padding: '0.15rem 0.6rem', borderRadius: '9999px', border: '1px solid rgba(14, 165, 233, 0.4)', textTransform: 'uppercase', fontWeight: 700 }}>
              RESIDENT USER
            </span>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              border: '1px solid #1d4ed8',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Main Page
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              backgroundColor: '#ef44441a',
              border: '1px solid #ef444440',
              color: '#f87171',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Logout 🚪
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Welcome Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', padding: '2rem', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Welcome back</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.2rem 0 0.5rem 0', color: '#f8fafc' }}>
              Hello, {userProfile?.displayName || 'Resident'} 👋
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>
              Unit Details: <strong style={{ color: '#cbd5e1' }}>{userProfile?.flatNo || 'A-402'}</strong> | Account: {userProfile?.email}
            </p>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem 1.5rem', background: '#0f172a', borderRadius: '14px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Maintenance Status</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: bills.some(b => b.status === 'UNPAID') ? '#fbbf24' : '#4ade80', marginTop: '0.2rem', display: 'block' }}>
              {bills.some(b => b.status === 'UNPAID') ? '⚠️ Due Soon ($250)' : '✅ All Paid'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
          {[
            { id: 'notices', label: '📢 Notice Board' },
            { id: 'bills', label: '💳 Bills & Maintenance' },
            { id: 'visitors', label: '🔑 Visitor Pass' },
            { id: 'amenities', label: '🏊 Amenities Booking' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#1e293b' : 'transparent',
                color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
                fontWeight: activeTab === tab.id ? 700 : 500,
                borderBottom: activeTab === tab.id ? '3px solid #38bdf8' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'notices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>Society Announcements</h3>
            {notices.map((item) => (
              <div key={item.id} style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#38bdf8' }}>{item.title}</h4>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.date}</span>
                </div>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.body}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bills' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Maintenance Invoices</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bills.map((bill) => (
                <div key={bill.id} style={{ backgroundColor: '#1e293b', padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem', color: '#f8fafc' }}>{bill.month}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Due Date: {bill.dueDate} | Amount: <strong>${bill.amount}</strong></span>
                  </div>

                  <div>
                    {bill.status === 'PAID' ? (
                      <span style={{ background: '#22c55e20', border: '1px solid #22c55e40', color: '#4ade80', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
                        ✅ PAID
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePayBill(bill.id)}
                        style={{
                          padding: '0.55rem 1.25rem',
                          borderRadius: '8px',
                          backgroundColor: '#0ea5e9',
                          color: '#fff',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
                        }}
                      >
                        Pay Now ($250)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'visitors' && (
          <div style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Generate Security Entry Pass</h3>
            <form onSubmit={handleGeneratePass} style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Visitor Full Name</label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Alex Johnson (Delivery / Guest)"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.95rem' }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  backgroundColor: '#0ea5e9',
                  color: '#fff',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Generate Passcode
              </button>
            </form>

            {generatedPassCode && (
              <div style={{ marginTop: '1.5rem', backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '16px', border: '1px stroke #38bdf8', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Security Gate Entry Pass for {visitorName}</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
                  {generatedPassCode}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#4ade80', margin: '0.5rem 0 0 0' }}>Share this code with your visitor to grant entry at gate.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'amenities' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Society Amenities</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {[
                { name: 'Clubhouse Swimming Pool', time: '6:00 AM - 9:00 PM', icon: '🏊' },
                { name: 'Fitness Gym & Yoga Center', time: '5:00 AM - 10:00 PM', icon: '🏋️' },
                { name: 'Tennis & Badminton Court', time: '7:00 AM - 8:00 PM', icon: '🎾' },
              ].map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                  <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem', color: '#f8fafc' }}>{item.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '1rem' }}>Open: {item.time}</span>
                  <button style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#38bdf8', fontWeight: 600, cursor: 'pointer' }}>
                    Reserve Slot
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
  const { userProfile, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'residents' | 'announcements' | 'settings'>('overview');

  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Annual General Body Meeting', date: '2026-08-05', body: 'AGM scheduled at Society Clubhouse at 10 AM.' },
    { id: 2, title: 'Water Tank Cleaning Notice', date: '2026-07-30', body: 'Water supply will be paused from 10 AM to 2 PM.' },
  ]);

  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeBody, setNewNoticeBody] = useState('');
  const [noticeSuccess, setNoticeSuccess] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSwitchToUser = async () => {
    await switchRole('user');
    navigate('/user-dashboard');
  };

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeBody) return;
    const newNotice = {
      id: Date.now(),
      title: newNoticeTitle,
      body: newNoticeBody,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements([newNotice, ...announcements]);
    setNewNoticeTitle('');
    setNewNoticeBody('');
    setNoticeSuccess('Announcement published successfully!');
    setTimeout(() => setNoticeSuccess(''), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top Navbar */}
      <header style={{ borderBottom: '1px solid #1e293b', backgroundColor: '#1e293b80', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>
            👑
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #a5b4fc, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Society Admin Portal
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Management & Governance Console</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block' }}>{userProfile?.displayName || userProfile?.email}</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.15rem 0.6rem', borderRadius: '9999px', border: '1px solid rgba(99, 102, 241, 0.4)', textTransform: 'uppercase', fontWeight: 700 }}>
              ADMINISTRATOR
            </span>
          </div>

          {/* Link to Main Site Showcase */}
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#cbd5e1',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🌐 Main Site
          </button>

          {/* Quick Switch to Resident View */}
          <button
            onClick={handleSwitchToUser}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#0ea5e920',
              border: '1px solid #0ea5e950',
              color: '#38bdf8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🏡 Switch to Resident View
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

      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', gap: '2rem' }}>
        {/* Sidebar */}
        <aside style={{ width: '260px', flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'overview', label: '📊 Dashboard Overview', icon: '📊' },
              { id: 'announcements', label: '📢 Notice Board', icon: '📢' },
              { id: 'residents', label: '👥 Resident Directory', icon: '👥' },
              { id: 'settings', label: '⚙️ Society Settings', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  textAlign: 'left',
                  padding: '0.85rem 1.1rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? '#6366f120' : 'transparent',
                  color: activeTab === tab.id ? '#818cf8' : '#94a3b8',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  borderLeft: activeTab === tab.id ? '4px solid #6366f1' : '4px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: '3rem', padding: '1.25rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#cbd5e1' }}>Admin Quick Tip</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Use the Notice Board tab to publish urgent broadcasts directly to all resident dashboards.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flexGrow: 1 }}>
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Welcome back, Admin 👋</h2>

              {/* Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Total Apartments</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#38bdf8' }}>148</div>
                  <span style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.5rem', display: 'inline-block' }}>96% Occupied</span>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Monthly Dues Collected</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#4ade80' }}>$42,800</div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', display: 'inline-block' }}>Target: $45,000</span>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Pending Maintenance Requests</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#fbbf24' }}>5</div>
                  <span style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.5rem', display: 'inline-block' }}>Requires Attention</span>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Active Visitor Passes Today</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#a78bfa' }}>23</div>
                  <span style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.5rem', display: 'inline-block' }}>Security Verified</span>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '1.5rem', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent System Activities</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                        <th style={{ padding: '0.75rem' }}>User / Unit</th>
                        <th style={{ padding: '0.75rem' }}>Action</th>
                        <th style={{ padding: '0.75rem' }}>Timestamp</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #33415500' }}>
                        <td style={{ padding: '0.85rem 0.75rem' }}>Flat 402 - John Doe</td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>Paid Maintenance Fee ($250)</td>
                        <td style={{ padding: '0.85rem 0.75rem', color: '#94a3b8' }}>10 mins ago</td>
                        <td style={{ padding: '0.85rem 0.75rem' }}><span style={{ background: '#22c55e20', color: '#4ade80', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>Success</span></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '0.85rem 0.75rem' }}>Flat 105 - Sarah Smith</td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>Booked Clubhouse Gym</td>
                        <td style={{ padding: '0.85rem 0.75rem', color: '#94a3b8' }}>1 hour ago</td>
                        <td style={{ padding: '0.85rem 0.75rem' }}><span style={{ background: '#3b82f620', color: '#60a5fa', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>Confirmed</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Publish Announcement</h2>
              <form onSubmit={handleAddNotice} style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {noticeSuccess && (
                  <div style={{ backgroundColor: '#22c55e20', border: '1px solid #22c55e40', color: '#4ade80', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    {noticeSuccess}
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Notice Title</label>
                  <input
                    type="text"
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    placeholder="e.g. Elevator Maintenance Scheduled"
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.95rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Notice Details</label>
                  <textarea
                    rows={4}
                    value={newNoticeBody}
                    onChange={(e) => setNewNoticeBody(e.target.value)}
                    placeholder="Enter full notice description for residents..."
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.95rem', fontFamily: 'inherit' }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    alignSelf: 'flex-start',
                    padding: '0.75rem 1.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#6366f1',
                    color: '#fff',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  Publish Notice
                </button>
              </form>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Active Announcements</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcements.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#1e293b', padding: '1.25rem', borderRadius: '12px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#818cf8' }}>{item.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.date}</span>
                    </div>
                    <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5 }}>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'residents' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Resident Directory</h2>
              <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '1.5rem', border: '1px solid #334155' }}>
                <p style={{ color: '#94a3b8' }}>List of registered residents and society members.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  {[
                    { name: 'John Doe', flat: 'A-402', email: 'john@society.com', status: 'Active' },
                    { name: 'Sarah Smith', flat: 'B-105', email: 'sarah@society.com', status: 'Active' },
                    { name: 'Robert Johnson', flat: 'C-301', email: 'robert@society.com', status: 'Pending Review' },
                  ].map((res, i) => (
                    <div key={i} style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{res.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#60a5fa', marginTop: '0.2rem' }}>Unit: {res.flat}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem' }}>{res.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Society Configuration</h2>
              <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
                <p style={{ color: '#94a3b8', margin: 0 }}>Configure society information, maintenance rules, and security credentials.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

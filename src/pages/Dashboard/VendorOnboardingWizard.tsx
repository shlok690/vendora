import React, { useState } from 'react';
import { useAuth, type VendorShopProfile } from '../../context/AuthContext';
import './Dashboard.css';

const BUSINESS_TYPES = [
  { label: 'Furniture',     icon: '🪑' },
  { label: 'Clothing',      icon: '👗' },
  { label: 'Electronics',   icon: '💡' },
  { label: 'Handicrafts',   icon: '🧶' },
  { label: 'Food & Spices', icon: '🌶️' },
  { label: 'Jewellery',     icon: '💍' },
  { label: 'Other',         icon: '🛍️' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1.5px solid #e2e8f0',
  fontSize: '0.92rem',
  fontFamily: 'inherit',
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#334155',
  marginBottom: 6,
};

const StepIndicator: React.FC<{ step: 1 | 2 }> = ({ step }) => {
  const steps = [
    { n: 1, label: 'What you sell' },
    { n: 2, label: 'Shop details' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '2rem' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'grid', placeItems: 'center',
                fontWeight: 800, fontSize: '0.85rem',
                background: step >= s.n ? '#2b2f4d' : '#f1f5f9',
                color: step >= s.n ? '#fff' : '#94a3b8',
                border: step >= s.n ? 'none' : '1.5px solid #e2e8f0',
              }}
            >
              {step > s.n ? '✓' : s.n}
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: step >= s.n ? '#334155' : '#94a3b8' }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 56, height: 2, background: step > s.n ? '#2b2f4d' : '#e2e8f0', marginBottom: 18 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const VendorOnboardingWizard: React.FC = () => {
  const { currentUser, saveVendorShopProfile } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [businessType, setBusinessType] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [saving, setSaving] = useState(false);

  const canContinueStep1 = businessType !== '';
  const canFinish = shopName.trim() !== '' && shopDescription.trim() !== '';

  const handleFinish = async () => {
    if (!canFinish || saving) return;
    setSaving(true);
    const shopProfile: VendorShopProfile = {
      businessType,
      shopName: shopName.trim(),
      shopDescription: shopDescription.trim(),
      city: city.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
    };
    try {
      await saveVendorShopProfile(shopProfile);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wizard-page" style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #eef0f8 0%, #f8fafc 55%)', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="wizard-card">
        <StepIndicator step={step} />

        {step === 1 && (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>What do you want to sell?</h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.75rem' }}>Choose the category that best fits your shop.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: '2rem' }}>
              {BUSINESS_TYPES.map((bt) => {
                const selected = businessType === bt.label;
                return (
                  <button
                    key={bt.label}
                    type="button"
                    onClick={() => setBusinessType(bt.label)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      padding: '1.25rem 0.75rem', borderRadius: 14, cursor: 'pointer',
                      background: selected ? '#eef0f8' : '#fff',
                      border: selected ? '2px solid #2b2f4d' : '1.5px solid #e2e8f0',
                      fontFamily: 'inherit', transition: 'all .15s',
                    }}
                  >
                    <span style={{ fontSize: '1.7rem' }}>{bt.icon}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: selected ? '#2b2f4d' : '#334155' }}>{bt.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => canContinueStep1 && setStep(2)}
                disabled={!canContinueStep1}
                style={{
                  padding: '12px 28px', borderRadius: 10, border: 'none',
                  background: canContinueStep1 ? '#2b2f4d' : '#e2e8f0',
                  color: canContinueStep1 ? '#fff' : '#94a3b8',
                  fontWeight: 700, fontSize: '0.9rem',
                  cursor: canContinueStep1 ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Tell us about your shop</h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.75rem' }}>Buyers will see this on your storefront.</p>

            <div style={{ marginBottom: '1.1rem' }}>
              <label style={labelStyle} htmlFor="shopName">Shop Name</label>
              <input
                id="shopName"
                style={inputStyle}
                type="text"
                placeholder="e.g. Riya Crafts"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '1.1rem' }}>
              <label style={labelStyle} htmlFor="shopDescription">Shop Description</label>
              <textarea
                id="shopDescription"
                style={{ ...inputStyle, resize: 'vertical', minHeight: 90, fontFamily: 'inherit' }}
                placeholder="What makes your shop special?"
                maxLength={500}
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
              />
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>{shopDescription.length}/500</div>
            </div>

            <div style={{ marginBottom: '1.1rem' }}>
              <label style={labelStyle} htmlFor="city">City / Location</label>
              <input
                id="city"
                style={inputStyle}
                type="text"
                placeholder="e.g. Pune, Maharashtra"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="wizard-2col">
              <div>
                <label style={labelStyle} htmlFor="whatsapp">WhatsApp Number</label>
                <input
                  id="whatsapp"
                  style={inputStyle}
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="contactEmail">Contact Email</label>
                <input
                  id="contactEmail"
                  style={inputStyle}
                  type="email"
                  placeholder="you@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ‹ Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={!canFinish || saving}
                style={{
                  padding: '12px 28px', borderRadius: 10, border: 'none',
                  background: canFinish && !saving ? '#2b2f4d' : '#e2e8f0',
                  color: canFinish && !saving ? '#fff' : '#94a3b8',
                  fontWeight: 700, fontSize: '0.9rem',
                  cursor: canFinish && !saving ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                {saving ? 'Saving…' : 'Finish Setup'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorOnboardingWizard;

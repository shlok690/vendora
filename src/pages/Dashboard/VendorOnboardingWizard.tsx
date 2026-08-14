import React, { useRef, useState } from 'react';
import { useAuth, type ShopLayoutStyle, type VendorShopProfile } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Dashboard.css';

export const BUSINESS_TYPES = [
  { label: 'Furniture',     icon: '🪑', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80' },
  { label: 'Clothing',      icon: '👗', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=300&q=80' },
  { label: 'Electronics',   icon: '💡', image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=300&q=80' },
  { label: 'Handicrafts',   icon: '🧶', image: 'https://images.unsplash.com/photo-1609881583302-61548332039c?auto=format&fit=crop&w=300&q=80' },
  { label: 'Food & Spices', icon: '🌶️', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80' },
  { label: 'Jewellery',     icon: '💍', image: 'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?auto=format&fit=crop&w=300&q=80' },
  { label: 'Other',         icon: '🛍️', image: 'https://images.unsplash.com/photo-1598305762558-328f599df683?auto=format&fit=crop&w=300&q=80' },
];

export const CITY_SUGGESTIONS = [
  'Mumbai, Maharashtra', 'Pune, Maharashtra', 'Delhi', 'Bengaluru, Karnataka',
  'Hyderabad, Telangana', 'Chennai, Tamil Nadu', 'Kolkata, West Bengal',
  'Ahmedabad, Gujarat', 'Jaipur, Rajasthan', 'Surat, Gujarat',
];

const THEME_PRESETS = ['#2b2f4d', '#2563eb', '#7c3aed', '#16a34a', '#d97706', '#dc2626', '#0891b2', '#db2777'];

const LAYOUT_STYLES: { id: ShopLayoutStyle; label: string; icon: string }[] = [
  { id: 'gallery', label: 'Gallery',      icon: '🖼️' },
  { id: 'logo',    label: 'Logo',         icon: '🏷️' },
  { id: 'banner',  label: 'Cover Banner', icon: '🪧' },
];

const PREVIEW_PRODUCTS = [
  'https://images.unsplash.com/photo-1601330862030-1e08c703ac04?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1613068431228-8cb6a1e92573?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1542044801-30d3e45ae49a?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1590605095243-072811dbe64c?auto=format&fit=crop&w=200&q=80',
];

/* ── HSV colour-picker math ── */
const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = (((g - b) / d) % 6) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
    if (h < 0) h += 360;
  }
  return [h, max === 0 ? 0 : d / max, max];
};

const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rgb: [number, number, number] = [0, 0, 0];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return [(rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255];
};

const ColorPicker: React.FC<{ value: string; onChange: (hex: string) => void }> = ({ value, onChange }) => {
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const [h, s, v] = rgbToHsv(...hexToRgb(value));

  const fromSv = (clientX: number, clientY: number) => {
    const box = svRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    onChange(rgbToHex(...hsvToRgb(h, x, 1 - y)));
  };

  const fromHue = (clientY: number) => {
    const bar = hueRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    onChange(rgbToHex(...hsvToRgb(y * 360, s, v)));
  };

  const hueColor = `rgb(${hsvToRgb(h, 1, 1).map((n) => Math.round(n)).join(',')})`;

  return (
    <div className="wizard-color-picker">
      <div
        ref={svRef}
        className="wizard-sv-box"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})` }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromSv(e.clientX, e.clientY); }}
        onPointerMove={(e) => { if (e.buttons === 1) fromSv(e.clientX, e.clientY); }}
      >
        <div className="wizard-sv-thumb" style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%`, background: value }} />
      </div>
      <div
        ref={hueRef}
        className="wizard-hue-bar"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromHue(e.clientY); }}
        onPointerMove={(e) => { if (e.buttons === 1) fromHue(e.clientY); }}
      >
        <div className="wizard-hue-thumb" style={{ top: `${(h / 360) * 100}%` }} />
      </div>
    </div>
  );
};

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

const backLinkStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: '#64748b', fontWeight: 700,
  fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit',
};

/** Downscales + compresses an image file client-side and returns a JPEG data URL small enough to store in Firestore. */
const resizeImageToDataUrl = (file: File, maxWidth: number, maxHeight: number, quality = 0.82): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read image'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

const ProgressBar: React.FC<{ step: number; total: number }> = ({ step, total }) => (
  <div style={{ marginBottom: '2rem' }}>
    <div style={{ height: 6, borderRadius: 9999, background: '#e2e8f0', overflow: 'hidden' }}>
      <div
        style={{
          height: '100%', borderRadius: 9999, background: '#2b2f4d',
          width: `${(step / total) * 100}%`, transition: 'width .3s ease',
        }}
      />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>Step {step} of {total}</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2b2f4d' }}>Vendor Setup</span>
    </div>
  </div>
);

const VendorOnboardingWizard: React.FC = () => {
  const { currentUser, saveVendorShopProfile } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [businessType, setBusinessType] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [themeColor, setThemeColor] = useState('#2b2f4d');
  const [layoutStyle, setLayoutStyle] = useState<ShopLayoutStyle>('gallery');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [bannerDataUrl, setBannerDataUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canContinueStep1 = businessType !== '';
  const canContinueStep2 = shopName.trim() !== '' && shopDescription.trim() !== '';

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoDataUrl(await resizeImageToDataUrl(file, 240, 240, 0.85));
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerDataUrl(await resizeImageToDataUrl(file, 1000, 320, 0.8));
  };

  const handleFinish = async () => {
    if (!canContinueStep2 || saving) return;
    setSaving(true);
    const shopProfile: VendorShopProfile = {
      businessType,
      shopName: shopName.trim(),
      shopDescription: shopDescription.trim(),
      city: city.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      themeColor,
      layoutStyle,
      logoDataUrl: logoDataUrl || undefined,
      bannerDataUrl: bannerDataUrl || undefined,
    };
    try {
      await saveVendorShopProfile(shopProfile);
      showToast('Shop created! Welcome to your dashboard 🎉', 'success');
    } catch (err) {
      showToast('Failed to create your shop. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wizard-page" style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #eef0f8 0%, #f8fafc 55%)', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className={`wizard-card${step === 3 ? ' wizard-card-wide' : ''}`}>
        {step !== 3 && <ProgressBar step={step} total={3} />}

        {step === 1 && (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>What type of business do you run?</h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.75rem' }}>Choose the category that best fits your shop.</p>

            <div className="wizard-cat-grid">
              {BUSINESS_TYPES.map((bt) => {
                const selected = businessType === bt.label;
                return (
                  <button
                    key={bt.label}
                    type="button"
                    onClick={() => setBusinessType(bt.label)}
                    className={`wizard-cat-card-photo${selected ? ' selected' : ''}`}
                  >
                    <img src={bt.image} alt="" className="wizard-cat-photo-img" loading="lazy" />
                    <div className="wizard-cat-photo-overlay" />
                    {selected && <span className="wizard-cat-photo-check">✓</span>}
                    <span className="wizard-cat-photo-label">{bt.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => canContinueStep1 && setStep(2)}
              disabled={!canContinueStep1}
              className="wizard-continue-bar"
              style={{
                background: canContinueStep1 ? '#2b2f4d' : '#e2e8f0',
                color: canContinueStep1 ? '#fff' : '#94a3b8',
                cursor: canContinueStep1 ? 'pointer' : 'not-allowed',
              }}
            >
              Continue
            </button>
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
                list="city-suggestions"
                style={inputStyle}
                type="text"
                placeholder="e.g. Pune, Maharashtra"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <datalist id="city-suggestions">
                {CITY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
              </datalist>
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
              <button type="button" onClick={() => setStep(1)} style={backLinkStyle}>‹ Back</button>
              <button
                type="button"
                onClick={() => canContinueStep2 && setStep(3)}
                disabled={!canContinueStep2}
                style={{
                  padding: '12px 28px', borderRadius: 10, border: 'none',
                  background: canContinueStep2 ? '#2b2f4d' : '#e2e8f0',
                  color: canContinueStep2 ? '#fff' : '#94a3b8',
                  fontWeight: 700, fontSize: '0.9rem',
                  cursor: canContinueStep2 ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="theme-step-split">
            <div className="theme-step-left">
              <ProgressBar step={step} total={3} />

              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Theme & Customization</h1>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.75rem' }}>Customize how your shop looks to buyers.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Theme Color</label>
                <ColorPicker value={themeColor} onChange={setThemeColor} />
                <div className="wizard-color-presets" style={{ marginTop: 10 }}>
                  {THEME_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`wizard-preset-swatch${themeColor.toLowerCase() === c ? ' selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setThemeColor(c)}
                      aria-label={`Use ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Layout Style</label>
                <div className="wizard-cat-grid">
                  {LAYOUT_STYLES.map((ls) => {
                    const selected = layoutStyle === ls.id;
                    return (
                      <button
                        key={ls.id}
                        type="button"
                        onClick={() => setLayoutStyle(ls.id)}
                        className={`wizard-cat-card${selected ? ' selected' : ''}`}
                      >
                        <span className="wizard-cat-icon">{ls.icon}</span>
                        <span className="wizard-cat-label">{ls.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="wizard-2col" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Shop Logo</label>
                  <div className="wizard-upload-box">
                    {logoDataUrl ? (
                      <img src={logoDataUrl} alt="Logo preview" className="wizard-upload-preview-logo" />
                    ) : (
                      <span>🏷️ Upload Logo</span>
                    )}
                    <input type="file" accept="image/*" onChange={handleLogoChange} aria-label="Upload shop logo" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Cover Banner</label>
                  <div className="wizard-upload-box">
                    {bannerDataUrl ? (
                      <img src={bannerDataUrl} alt="Banner preview" className="wizard-upload-preview-banner" />
                    ) : (
                      <span>🖼️ Upload Banner</span>
                    )}
                    <input type="file" accept="image/*" onChange={handleBannerChange} aria-label="Upload cover banner" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={() => setStep(2)} style={backLinkStyle}>‹ Back</button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={saving}
                  style={{
                    padding: '12px 28px', borderRadius: 10, border: 'none',
                    background: !saving ? '#2b2f4d' : '#e2e8f0',
                    color: !saving ? '#fff' : '#94a3b8',
                    fontWeight: 700, fontSize: '0.9rem',
                    cursor: !saving ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                  }}
                >
                  {saving ? 'Saving…' : 'Finish Setup'}
                </button>
              </div>
            </div>

            <div className="theme-step-right">
              <div className="theme-step-right-sticky">
                <label style={labelStyle}>Live Preview</label>
                <div className="storefront-preview">
                  <div className="storefront-preview-chrome">
                    <span className="storefront-preview-dot" />
                    <span className="storefront-preview-dot" />
                    <span className="storefront-preview-dot" />
                  </div>
                  <div
                    className="storefront-preview-hero"
                    style={{
                      backgroundImage: bannerDataUrl ? `url(${bannerDataUrl})` : undefined,
                      backgroundColor: themeColor,
                    }}
                  >
                    <div className="storefront-preview-brand">
                      <div className="wizard-shop-preview-logo">
                        {logoDataUrl
                          ? <img src={logoDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                          : (shopName.trim()[0] || '🏪').toUpperCase()}
                      </div>
                      <span className="wizard-shop-preview-name">{shopName.trim() || 'Your Shop Name'}</span>
                    </div>
                    <div className="storefront-preview-search">🔍 Search {shopName.trim() || 'this shop'}…</div>
                  </div>
                  <div className="storefront-preview-body">
                    <div className="storefront-preview-grid">
                      {PREVIEW_PRODUCTS.map((src, i) => (
                        <div key={i} className="storefront-preview-card">
                          <img src={src} alt="" className="storefront-preview-card-img" loading="lazy" />
                          <div className="storefront-preview-line" />
                          <div className="storefront-preview-line short" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="storefront-preview-footer" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOnboardingWizard;

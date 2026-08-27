import React, { useEffect, useRef, useState } from 'react';
import { useAuth, type VendorShopProfile } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Icon, { type IconName } from '../../components/Icon';
import CityCombobox from '../../components/CityCombobox';
import UiStylePicker from '../../components/UiStylePicker';
import ColorPicker, { THEME_PRESETS } from '../../components/ColorPicker';
import { resizeImageToDataUrl } from '../../utils/image';
import { DEFAULT_UI_STYLE, normalizeUiStyle, type UiStyle } from '../../utils/uiStyle';
import {
  DEFAULT_THEME_COLOR,
  TOTAL_STEPS,
  clampStep,
  clearLocalDraft,
  isDraftMeaningful,
  loadLocalDraft,
  normalizeDraft,
  pickNewerDraft,
  saveLocalDraft,
  type VendorOnboardingDraft,
  type WizardStep,
} from '../../utils/onboardingDraft';
import './Dashboard.css';

export const BUSINESS_TYPES: { label: string; icon: IconName; image: string }[] = [
  { label: 'Furniture',     icon: 'chair', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80' },
  { label: 'Clothing',      icon: 'shirt', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=300&q=80' },
  { label: 'Electronics',   icon: 'device', image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=300&q=80' },
  { label: 'Handicrafts',   icon: 'craft', image: 'https://images.unsplash.com/photo-1609881583302-61548332039c?auto=format&fit=crop&w=300&q=80' },
  { label: 'Food & Spices', icon: 'spice', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80' },
  { label: 'Jewellery',     icon: 'gem', image: 'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?auto=format&fit=crop&w=300&q=80' },
  { label: 'Other',         icon: 'storefront', image: 'https://images.unsplash.com/photo-1598305762558-328f599df683?auto=format&fit=crop&w=300&q=80' },
];

export const SHOP_NAME_MAX = 50;

/** Indian mobile numbers: ten digits starting 6-9, dialled as +91. */
export const WHATSAPP_LENGTH = 10;
export const WHATSAPP_PREFIX = '+91';

/** Keeps only digits and drops a leading 91/0 so pasted numbers land correctly. */
export const toLocalDigits = (input: string): string => {
  let digits = input.replace(/\D/g, '');
  if (digits.length > WHATSAPP_LENGTH && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length > WHATSAPP_LENGTH && digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, WHATSAPP_LENGTH);
};

export const isValidWhatsapp = (digits: string) => /^[6-9]\d{9}$/.test(digits);

export const CITY_SUGGESTIONS = [
  'Mumbai, Maharashtra', 'Pune, Maharashtra', 'Delhi', 'Bengaluru, Karnataka',
  'Hyderabad, Telangana', 'Chennai, Tamil Nadu', 'Kolkata, West Bengal',
  'Ahmedabad, Gujarat', 'Jaipur, Rajasthan', 'Surat, Gujarat',
];

const PREVIEW_PRODUCTS = [
  'https://images.unsplash.com/photo-1601330862030-1e08c703ac04?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1613068431228-8cb6a1e92573?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1542044801-30d3e45ae49a?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1590605095243-072811dbe64c?auto=format&fit=crop&w=200&q=80',
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1.5px solid var(--line)',
  fontSize: '0.92rem',
  fontFamily: 'inherit',
  color: 'var(--ink)',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: 'var(--ink-2)',
  marginBottom: 6,
};

const backLinkStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--muted)', fontWeight: 700,
  fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit',
};

const ProgressBar: React.FC<{ step: number; total: number; onReset?: () => void }> = ({ step, total, onReset }) => (
  <div style={{ marginBottom: '2rem' }}>
    <div style={{ height: 6, borderRadius: 9999, background: 'var(--line)', overflow: 'hidden' }}>
      <div
        style={{
          height: '100%', borderRadius: 9999, background: 'var(--ink)',
          width: `${(step / total) * 100}%`, transition: 'width .3s ease',
        }}
      />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)' }}>Step {step} of {total}</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink)' }}>Vendor Setup</span>
    </div>
    {onReset && (
      <div className="wizard-autosave-row">
        <span className="wizard-autosave-note">
          <Icon name="check" size={12} />
          Progress saved automatically
        </span>
        <button type="button" className="wizard-reset-btn" onClick={onReset}>Start over</button>
      </div>
    )}
  </div>
);

const REMOTE_CLEARED = '__cleared__';

const VendorOnboardingWizard: React.FC = () => {
  const {
    currentUser,
    userProfile,
    saveVendorShopProfile,
    saveVendorOnboardingDraft,
    clearVendorOnboardingDraft,
  } = useAuth();
  const { showToast } = useToast();
  const uid = currentUser?.uid ?? null;

  /* Resume an interrupted setup: whichever of the local and Firestore copies was
     written last wins. Read lazily so the very first paint is already on the
     right step — no flash of step 1 before an effect corrects it. */
  const [restored] = useState<VendorOnboardingDraft | null>(() => {
    // A finished shop outranks any draft — never rehydrate one over a real storefront.
    if (!uid || userProfile?.shopProfile) return null;
    const draft = pickNewerDraft(loadLocalDraft(uid), normalizeDraft(userProfile?.onboardingDraft));
    if (!draft) return null;
    // A category that no longer exists must not stay selected, or step 1 would
    // look empty while still counting as complete.
    const businessType = BUSINESS_TYPES.some((bt) => bt.label === draft.businessType) ? draft.businessType : '';
    return { ...draft, businessType };
  });

  const [step, setStep] = useState<WizardStep>(() => (restored ? clampStep(restored.step, restored) : 1));
  const [businessType, setBusinessType] = useState(restored?.businessType ?? '');
  const [shopName, setShopName] = useState((restored?.shopName ?? '').slice(0, SHOP_NAME_MAX));
  const [shopDescription, setShopDescription] = useState(restored?.shopDescription ?? '');
  const [city, setCity] = useState(restored?.city ?? '');
  const [whatsapp, setWhatsapp] = useState(toLocalDigits(restored?.whatsapp ?? ''));
  const [contactEmail, setContactEmail] = useState(restored?.contactEmail ?? currentUser?.email ?? '');
  const [themeColor, setThemeColor] = useState(restored?.themeColor ?? DEFAULT_THEME_COLOR);
  const [uiStyle, setUiStyle] = useState<UiStyle>(normalizeUiStyle(restored?.uiStyle));
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(restored?.logoDataUrl ?? null);
  const [bannerDataUrl, setBannerDataUrl] = useState<string | null>(restored?.bannerDataUrl ?? null);
  const [saving, setSaving] = useState(false);

  const canContinueStep1 = businessType !== '';
  // The number is optional, but a half-typed one must not pass.
  const whatsappOk = whatsapp === '' || isValidWhatsapp(whatsapp);
  const whatsappError = whatsapp !== '' && !isValidWhatsapp(whatsapp);
  const canContinueStep2 = shopName.trim() !== '' && shopDescription.trim() !== '' && whatsappOk;

  /* ── Draft autosave ──────────────────────────────────────────────────── */
  const draftRef = useRef<VendorOnboardingDraft | null>(null);
  const localTimerRef = useRef<number | undefined>(undefined);
  const remoteTimerRef = useRef<number | undefined>(undefined);
  // Signature of what Firestore already holds, so idle re-renders don't rewrite it.
  const lastRemoteRef = useRef<string>(
    restored ? JSON.stringify({ ...restored, updatedAt: '' }) : REMOTE_CLEARED
  );
  // Once the shop exists the draft is deleted on purpose — no pending autosave
  // or unmount flush may resurrect it. Starts true if a shop is already on file.
  const finishedRef = useRef(Boolean(userProfile?.shopProfile));

  const flushRemote = () => {
    if (!uid || finishedRef.current) return;
    const draft = draftRef.current;
    if (!draft) {
      if (lastRemoteRef.current === REMOTE_CLEARED) return;
      lastRemoteRef.current = REMOTE_CLEARED;
      void clearVendorOnboardingDraft();
      return;
    }
    const signature = JSON.stringify({ ...draft, updatedAt: '' });
    if (signature === lastRemoteRef.current) return;
    lastRemoteRef.current = signature;
    void saveVendorOnboardingDraft(draft);
  };

  useEffect(() => {
    if (!uid || finishedRef.current) return;

    const draft: VendorOnboardingDraft = {
      step,
      businessType,
      shopName,
      shopDescription,
      city,
      whatsapp,
      contactEmail,
      themeColor,
      uiStyle,
      logoDataUrl,
      bannerDataUrl,
      updatedAt: new Date().toISOString(),
    };

    // An untouched wizard isn't worth resuming — drop any stored copy rather than
    // persisting an empty shell that would later "restore" over nothing.
    const worthKeeping = isDraftMeaningful(draft);
    draftRef.current = worthKeeping ? draft : null;

    window.clearTimeout(localTimerRef.current);
    window.clearTimeout(remoteTimerRef.current);

    if (worthKeeping) {
      localTimerRef.current = window.setTimeout(() => saveLocalDraft(uid, draft), 250);
    } else {
      clearLocalDraft(uid);
    }
    // Firestore is the slow cross-device copy — only written once typing settles.
    remoteTimerRef.current = window.setTimeout(flushRemote, 1500);

    return () => {
      window.clearTimeout(localTimerRef.current);
      window.clearTimeout(remoteTimerRef.current);
    };
  }, [uid, step, businessType, shopName, shopDescription, city, whatsapp, contactEmail, themeColor, uiStyle, logoDataUrl, bannerDataUrl]);

  /* Debouncing leaves a window where a write is still pending. Flush it when the
     tab is hidden or closed (pagehide is the reliable one on mobile browsers) and
     when the wizard unmounts, e.g. navigating away mid-setup. */
  useEffect(() => {
    if (!uid) return;
    const flush = () => {
      if (finishedRef.current || !draftRef.current) return;
      window.clearTimeout(localTimerRef.current);
      saveLocalDraft(uid, draftRef.current);
      flushRemote();
    };
    const onVisibilityChange = () => { if (document.visibilityState === 'hidden') flush(); };

    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      flush();
    };
  }, [uid]);

  /* Tell the vendor why they didn't land back on step 1. Guarded by a ref rather
     than an empty dep array alone: StrictMode runs mount effects twice in dev,
     which would otherwise stack two identical toasts on every refresh. */
  const resumedStep = restored ? clampStep(restored.step, restored) : 1;
  const resumeToastShownRef = useRef(false);
  useEffect(() => {
    if (resumeToastShownRef.current || !isDraftMeaningful(restored)) return;
    resumeToastShownRef.current = true;
    showToast('Welcome back — resuming your setup at step ' + resumedStep + ' of ' + TOTAL_STEPS, 'info');
  }, []);

  const handleStartOver = () => {
    window.clearTimeout(localTimerRef.current);
    window.clearTimeout(remoteTimerRef.current);
    draftRef.current = null;
    lastRemoteRef.current = REMOTE_CLEARED;
    setStep(1);
    setBusinessType('');
    setShopName('');
    setShopDescription('');
    setCity('');
    setWhatsapp('');
    setContactEmail(currentUser?.email || '');
    setThemeColor(DEFAULT_THEME_COLOR);
    setUiStyle(DEFAULT_UI_STYLE);
    setLogoDataUrl(null);
    setBannerDataUrl(null);
    void clearVendorOnboardingDraft();
    showToast('Saved draft cleared — starting fresh', 'info');
  };

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
      whatsapp: whatsapp ? `${WHATSAPP_PREFIX} ${whatsapp}` : undefined,
      contactEmail: contactEmail.trim() || undefined,
      themeColor,
      uiStyle,
      logoDataUrl: logoDataUrl || undefined,
      bannerDataUrl: bannerDataUrl || undefined,
    };
    try {
      // Stop autosaving before the draft is deleted, so nothing writes it back.
      finishedRef.current = true;
      window.clearTimeout(localTimerRef.current);
      window.clearTimeout(remoteTimerRef.current);
      const synced = await saveVendorShopProfile(shopProfile);
      showToast(
        synced
          ? 'Shop created — welcome to your dashboard'
          : 'Shop created — saved on this device, it will sync when the connection returns',
        synced ? 'success' : 'info'
      );
    } catch (err) {
      // Setup isn't done after all — keep protecting their work.
      finishedRef.current = false;
      showToast('Failed to create your shop. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wizard-page" style={{ minHeight: '100vh', background: 'linear-gradient(160deg, var(--paper-2) 0%, var(--paper) 55%)', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className={`wizard-card${step === 3 ? ' wizard-card-wide' : ''}`}>
        {step !== 3 && <ProgressBar step={step} total={TOTAL_STEPS} onReset={handleStartOver} />}

        {step === 1 && (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>What type of business do you run?</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.75rem' }}>Choose the category that best fits your shop.</p>

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
                background: canContinueStep1 ? 'var(--ink)' : 'var(--line)',
                color: canContinueStep1 ? '#fff' : 'var(--faint)',
                cursor: canContinueStep1 ? 'pointer' : 'not-allowed',
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>Tell us about your shop</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.75rem' }}>Buyers will see this on your storefront.</p>

            <div style={{ marginBottom: '1.1rem' }}>
              <label style={labelStyle} htmlFor="shopName">Shop Name</label>
              <input
                id="shopName"
                style={inputStyle}
                type="text"
                placeholder="e.g. Riya Crafts"
                maxLength={SHOP_NAME_MAX}
                value={shopName}
                onChange={(e) => setShopName(e.target.value.slice(0, SHOP_NAME_MAX))}
              />
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--faint)', marginTop: 4 }}>{shopName.length}/{SHOP_NAME_MAX}</div>
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
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--faint)', marginTop: 4 }}>{shopDescription.length}/500</div>
            </div>

            <div style={{ marginBottom: '1.1rem' }}>
              <label style={labelStyle} htmlFor="city">City / Location</label>
              <CityCombobox
                id="city"
                value={city}
                onChange={setCity}
                placeholder="Search Indian cities — e.g. Pune"
              />
            </div>

            <div className="wizard-2col">
              <div>
                <label style={labelStyle} htmlFor="whatsapp">WhatsApp Number</label>
                <div className={`phone-field${whatsappError ? ' invalid' : ''}`}>
                  <span className="phone-field-prefix">{WHATSAPP_PREFIX}</span>
                  <input
                    id="whatsapp"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="98765 43210"
                    maxLength={WHATSAPP_LENGTH}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(toLocalDigits(e.target.value))}
                  />
                </div>
                <div className={`phone-field-hint${whatsappError ? ' invalid' : ''}`}>
                  {whatsappError
                    ? `Enter all ${WHATSAPP_LENGTH} digits, starting 6–9.`
                    : `${WHATSAPP_LENGTH}-digit Indian mobile number`}
                </div>
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
                  background: canContinueStep2 ? 'var(--ink)' : 'var(--line)',
                  color: canContinueStep2 ? '#fff' : 'var(--faint)',
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
              <ProgressBar step={step} total={TOTAL_STEPS} onReset={handleStartOver} />

              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>Theme & Customization</h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.75rem' }}>Customize how your shop looks to buyers.</p>

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
                <label style={labelStyle}>Storefront Style</label>
                <UiStylePicker value={uiStyle} onChange={setUiStyle} />
              </div>

              <div className="wizard-2col" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Shop Logo</label>
                  <div className="wizard-upload-box">
                    {logoDataUrl ? (
                      <img src={logoDataUrl} alt="Logo preview" className="wizard-upload-preview-logo" />
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Icon name="storefront" size={17} />Upload logo</span>
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
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Icon name="grid" size={17} />Upload banner</span>
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
                    background: !saving ? 'var(--ink)' : 'var(--line)',
                    color: !saving ? '#fff' : 'var(--faint)',
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
                          : (shopName.trim()[0] || 'V').toUpperCase()}
                      </div>
                      <span className="wizard-shop-preview-name">{shopName.trim() || 'Your Shop Name'}</span>
                    </div>
                    <div className="storefront-preview-search"><Icon name="search" size={13} />Search {shopName.trim() || 'this shop'}…</div>
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

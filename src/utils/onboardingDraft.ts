import type { ShopLayoutStyle } from '../context/AuthContext';

/**
 * Persistence for the half-finished vendor onboarding wizard.
 *
 * The wizard is three steps long and can hold uploaded images, so losing it to a
 * refresh (or to a phone backgrounding the tab) means retyping everything. Every
 * change is mirrored to localStorage — instantly available on the next mount —
 * and to `users/{uid}.onboardingDraft` in Firestore, which is what lets a vendor
 * resume on another device. Same two-tier pattern as the role/profile cache in
 * AuthContext.
 */

export type WizardStep = 1 | 2 | 3;

export const TOTAL_STEPS = 3;
export const DEFAULT_THEME_COLOR = 'var(--ink)';
export const DEFAULT_LAYOUT_STYLE: ShopLayoutStyle = 'gallery';

export interface VendorOnboardingDraft {
  step: WizardStep;
  businessType: string;
  shopName: string;
  shopDescription: string;
  city: string;
  whatsapp: string;
  contactEmail: string;
  themeColor: string;
  layoutStyle: ShopLayoutStyle;
  logoDataUrl: string | null;
  bannerDataUrl: string | null;
  /** ISO timestamp — used to pick the newer of the local and Firestore copies. */
  updatedAt: string;
}

export const draftStorageKey = (uid: string) => `vendor_onboarding_draft_${uid}`;

const LAYOUT_STYLES: ShopLayoutStyle[] = ['gallery', 'logo', 'banner'];

const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);

const asImage = (value: unknown) =>
  typeof value === 'string' && value.startsWith('data:image/') ? value : null;

/** Coerces anything read back from storage/Firestore into a usable draft, or null. */
export const normalizeDraft = (raw: unknown): VendorOnboardingDraft | null => {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;
  const rawStep = Number(d.step);
  const step: WizardStep = rawStep === 2 || rawStep === 3 ? rawStep : 1;

  return {
    step,
    businessType: asString(d.businessType),
    shopName: asString(d.shopName),
    shopDescription: asString(d.shopDescription),
    city: asString(d.city),
    whatsapp: asString(d.whatsapp),
    contactEmail: asString(d.contactEmail),
    themeColor: asString(d.themeColor, DEFAULT_THEME_COLOR) || DEFAULT_THEME_COLOR,
    layoutStyle: LAYOUT_STYLES.includes(d.layoutStyle as ShopLayoutStyle)
      ? (d.layoutStyle as ShopLayoutStyle)
      : DEFAULT_LAYOUT_STYLE,
    logoDataUrl: asImage(d.logoDataUrl),
    bannerDataUrl: asImage(d.bannerDataUrl),
    updatedAt: asString(d.updatedAt),
  };
};

/**
 * The furthest step whose prerequisites are actually satisfied. A draft saved on
 * step 3 whose shop name was later cleared must not restore past the fields that
 * gate it, otherwise the wizard reopens on a step the user can't legally be on.
 */
export const clampStep = (
  step: WizardStep,
  d: Pick<VendorOnboardingDraft, 'businessType' | 'shopName' | 'shopDescription'>
): WizardStep => {
  const step1Done = d.businessType !== '';
  const step2Done = step1Done && d.shopName.trim() !== '' && d.shopDescription.trim() !== '';
  if (step === 3 && step2Done) return 3;
  if (step >= 2 && step1Done) return 2;
  return 1;
};

/** True when the draft holds something the vendor would be annoyed to lose. */
export const isDraftMeaningful = (d: VendorOnboardingDraft | null): boolean => {
  if (!d) return false;
  return Boolean(
    d.businessType ||
      d.shopName.trim() ||
      d.shopDescription.trim() ||
      d.city.trim() ||
      d.whatsapp.trim() ||
      d.logoDataUrl ||
      d.bannerDataUrl ||
      d.step > 1 ||
      d.themeColor !== DEFAULT_THEME_COLOR ||
      d.layoutStyle !== DEFAULT_LAYOUT_STYLE
  );
};

/** Whichever copy was written last; either argument may be null. */
export const pickNewerDraft = (
  a: VendorOnboardingDraft | null,
  b: VendorOnboardingDraft | null
): VendorOnboardingDraft | null => {
  if (!a) return b;
  if (!b) return a;
  return b.updatedAt > a.updatedAt ? b : a;
};

export const loadLocalDraft = (uid: string): VendorOnboardingDraft | null => {
  try {
    const raw = localStorage.getItem(draftStorageKey(uid));
    return raw ? normalizeDraft(JSON.parse(raw)) : null;
  } catch (e) {
    console.warn('Could not read onboarding draft:', e);
    return null;
  }
};

export const saveLocalDraft = (uid: string, draft: VendorOnboardingDraft) => {
  const key = draftStorageKey(uid);
  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (e) {
    // Almost certainly a quota error from the logo/banner data URLs. Keep the
    // typed fields rather than dropping the whole draft on the floor.
    try {
      localStorage.setItem(key, JSON.stringify({ ...draft, logoDataUrl: null, bannerDataUrl: null }));
    } catch (inner) {
      console.warn('Could not save onboarding draft locally:', inner);
    }
  }
};

export const clearLocalDraft = (uid: string) => {
  try {
    localStorage.removeItem(draftStorageKey(uid));
  } catch (e) {
    console.warn('Could not clear onboarding draft:', e);
  }
};

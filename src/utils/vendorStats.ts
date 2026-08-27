import type { VendorShopProfile } from '../context/AuthContext';

/**
 * Helpers for rendering the vendor's own record on the dashboard. The dashboard
 * used to show invented figures (48 orders, ₹18,400 revenue, a 4.8 rating) from
 * hardcoded arrays; nothing in this app produces that data, so it is gone rather
 * than replaced with numbers that merely look real.
 */

/** Digits-only form of a stored "+91 98765 43210", as a wa.me link. */
export const whatsappLink = (whatsapp?: VendorShopProfile['whatsapp']): string | null => {
  if (!whatsapp || !whatsapp.trim()) return null;
  const digits = whatsapp.replace(/\D/g, '');
  return digits.length >= 10 ? `https://wa.me/${digits}` : null;
};

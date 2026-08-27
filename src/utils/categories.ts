/**
 * A vendor's own product categories.
 *
 * These started life as plain strings on the shop profile; they now carry an
 * optional photo, so anything read back has to cope with both shapes rather
 * than dropping categories saved before the change.
 */

export interface ShopCategory {
  name: string;
  imageDataUrl?: string;
}

export const CATEGORY_MAX_LENGTH = 30;
export const CATEGORY_LIMIT = 20;

/** Case-insensitive identity, so "Chairs" and "chairs" are the same category. */
export const categoryKey = (name: string) => name.trim().toLowerCase();

export const cleanCategoryName = (name: string) => name.trim().replace(/\s+/g, ' ');

const asImage = (value: unknown) =>
  typeof value === 'string' && value.startsWith('data:image/') ? value : undefined;

/** Accepts the legacy `string[]` shape as well as the current one. */
export const normalizeCategories = (raw: unknown): ShopCategory[] => {
  if (!Array.isArray(raw)) return [];

  const out: ShopCategory[] = [];
  const seen = new Set<string>();

  for (const entry of raw) {
    let name = '';
    let imageDataUrl: string | undefined;

    if (typeof entry === 'string') {
      name = cleanCategoryName(entry);
    } else if (entry && typeof entry === 'object') {
      const e = entry as Record<string, unknown>;
      name = cleanCategoryName(typeof e.name === 'string' ? e.name : '');
      imageDataUrl = asImage(e.imageDataUrl);
    }

    if (!name || name.length > CATEGORY_MAX_LENGTH) continue;
    const key = categoryKey(name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(imageDataUrl ? { name, imageDataUrl } : { name });
  }

  return out.slice(0, CATEGORY_LIMIT);
};

export const categoryNames = (categories: ShopCategory[]) => categories.map((c) => c.name);
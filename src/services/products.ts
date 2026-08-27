import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * A vendor's products live in `users/{uid}/products/{id}`.
 *
 * Subcollection rather than an array on the user doc: Firestore caps a document
 * at 1MB, and product photos are stored as compressed data URLs, so a dozen
 * products would blow past it. Each product gets its own document instead.
 *
 * Every read and write is mirrored to localStorage, matching how AuthContext
 * caches the profile — the dashboard has to keep working when Firestore is slow
 * or blocked (an ad-blocker refusing firestore.googleapis.com does exactly that).
 */

export interface VendorProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  imageDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const TIMEOUT_MS = 10000;

const withTimeout = <T,>(promise: Promise<T>, ms = TIMEOUT_MS): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), ms)),
  ]);

const cacheKey = (uid: string) => `vendor_products_${uid}`;

/** Firestore rejects `undefined` outright, so optional fields are dropped instead. */
const stripUndefined = <T extends object>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;

const num = (value: unknown, fallback = 0) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const str = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);

/** Coerces anything read back from storage or Firestore into a usable product. */
export const normalizeProduct = (raw: unknown): VendorProduct | null => {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;
  const id = str(d.id).trim();
  const name = str(d.name).trim();
  if (!id || !name) return null;

  const image = str(d.imageDataUrl);
  return {
    id,
    name,
    price: Math.max(0, num(d.price)),
    category: str(d.category),
    description: str(d.description),
    stock: Math.max(0, Math.round(num(d.stock))),
    imageDataUrl: image.startsWith('data:image/') ? image : undefined,
    createdAt: str(d.createdAt),
    updatedAt: str(d.updatedAt),
  };
};

const byNewest = (a: VendorProduct, b: VendorProduct) => b.createdAt.localeCompare(a.createdAt);

export const readCachedProducts = (uid: string): VendorProduct[] => {
  try {
    const raw = localStorage.getItem(cacheKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeProduct).filter((p): p is VendorProduct => p !== null).sort(byNewest);
  } catch (e) {
    console.warn('Could not read cached products:', e);
    return [];
  }
};

const writeCachedProducts = (uid: string, products: VendorProduct[]) => {
  try {
    localStorage.setItem(cacheKey(uid), JSON.stringify(products));
  } catch (e) {
    // Almost certainly quota, from the product images. Keep the text so the
    // list still renders rather than losing everything.
    try {
      localStorage.setItem(cacheKey(uid), JSON.stringify(products.map((p) => ({ ...p, imageDataUrl: undefined }))));
    } catch (inner) {
      console.warn('Could not cache products:', inner);
    }
  }
};

export interface LoadResult {
  products: VendorProduct[];
  /** True when Firestore didn't answer and this came from the local mirror. */
  fromCache: boolean;
}

export const listProducts = async (uid: string): Promise<LoadResult> => {
  try {
    const snap = await withTimeout(getDocs(collection(db, 'users', uid, 'products')));
    const products = snap.docs
      .map((d) => normalizeProduct({ ...d.data(), id: d.id }))
      .filter((p): p is VendorProduct => p !== null)
      .sort(byNewest);
    writeCachedProducts(uid, products);
    return { products, fromCache: false };
  } catch (err) {
    console.warn('Firestore product read failed; using local cache:', err);
    return { products: readCachedProducts(uid), fromCache: true };
  }
};

export const newProductId = () =>
  `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** Writes locally first, then to Firestore. Resolves true only if Firestore confirmed. */
export const saveProduct = async (uid: string, product: VendorProduct): Promise<boolean> => {
  const existing = readCachedProducts(uid).filter((p) => p.id !== product.id);
  writeCachedProducts(uid, [product, ...existing].sort(byNewest));

  try {
    const { id, ...fields } = product;
    await withTimeout(setDoc(doc(db, 'users', uid, 'products', id), stripUndefined(fields)));
    return true;
  } catch (err) {
    console.warn('Firestore product save failed; kept locally:', err);
    return false;
  }
};

export const deleteProduct = async (uid: string, id: string): Promise<boolean> => {
  writeCachedProducts(uid, readCachedProducts(uid).filter((p) => p.id !== id));

  try {
    await withTimeout(deleteDoc(doc(db, 'users', uid, 'products', id)));
    return true;
  } catch (err) {
    console.warn('Firestore product delete failed; removed locally:', err);
    return false;
  }
};

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  deleteProduct,
  listProducts,
  newProductId,
  saveProduct,
  type VendorProduct,
} from '../services/products';

export interface ProductDraft {
  id?: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  imageDataUrl?: string;
}

/** Loads the signed-in vendor's products and keeps the list in step with edits. */
export const useVendorProducts = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const uid = currentUser?.uid ?? null;

  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!uid) { setProducts([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    listProducts(uid).then(({ products: loaded, fromCache }) => {
      if (cancelled) return;
      setProducts(loaded);
      setOffline(fromCache);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [uid]);

  const upsert = useCallback(async (draft: ProductDraft) => {
    if (!uid) return false;
    const now = new Date().toISOString();
    const existing = draft.id ? products.find((p) => p.id === draft.id) : undefined;

    const product: VendorProduct = {
      id: draft.id ?? newProductId(),
      name: draft.name.trim(),
      price: draft.price,
      category: draft.category,
      description: draft.description.trim(),
      stock: draft.stock,
      imageDataUrl: draft.imageDataUrl,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    // Show it immediately; the write is confirmed (or not) underneath.
    setProducts((prev) => {
      const rest = prev.filter((p) => p.id !== product.id);
      return [product, ...rest].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });

    const synced = await saveProduct(uid, product);
    showToast(
      synced
        ? (existing ? 'Product updated' : `“${product.name}” added`)
        : 'Saved on this device — it will sync when the connection returns',
      synced ? 'success' : 'info'
    );
    return true;
  }, [uid, products, showToast]);

  const remove = useCallback(async (id: string) => {
    if (!uid) return;
    const gone = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    const synced = await deleteProduct(uid, id);
    showToast(
      synced ? `“${gone?.name ?? 'Product'}” removed` : 'Removed on this device — it will sync when the connection returns',
      synced ? 'info' : 'info'
    );
  }, [uid, products, showToast]);

  return { products, loading, offline, upsert, remove };
};
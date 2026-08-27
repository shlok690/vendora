import React, { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import { useToast } from '../../context/ToastContext';
import { resizeImageToDataUrl } from '../../utils/image';
import type { VendorProduct } from '../../services/products';
import type { ProductDraft } from '../../hooks/useVendorProducts';
import { CATEGORY_LIMIT, CATEGORY_MAX_LENGTH, categoryKey, cleanCategoryName } from '../../utils/categories';

export const PRODUCT_NAME_MAX = 80;
export const PRODUCT_DESCRIPTION_MAX = 500;

const blank = () => ({ name: '', price: '', category: '', description: '', stock: '', imageDataUrl: undefined as string | undefined });
type FormState = ReturnType<typeof blank>;

interface ProductFormModalProps {
  open: boolean;
  /** null when adding, a product when editing. */
  editing: VendorProduct | null;
  categories: string[];
  onClose: () => void;
  onSave: (draft: ProductDraft) => Promise<boolean>;
  /** Creates a category on the shop profile. Called before the product is
      saved when the vendor typed a new one here. */
  onAddCategory: (name: string) => Promise<boolean>;
}

/** Marks the "type a new one" choice in the category select. */
const NEW_CATEGORY = '\u0000new';

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  editing,
  categories,
  onClose,
  onSave,
  onAddCategory,
}) => {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);
  // With no categories yet, the field starts as a name box: a product can't be
  // filed without one, so the vendor creates it here rather than being sent away.
  const [creating, setCreating] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Refill whenever the dialog opens, so a cancelled edit leaves nothing behind.
  // Deliberately not keyed on `categories` — the parent rebuilds that array on
  // every render, and re-running here would wipe a half-typed form.
  useEffect(() => {
    if (!open) return;
    setNewCategory('');
    setCreating(!editing && categories.length === 0);
    setForm(
      editing
        ? {
            name: editing.name,
            price: String(editing.price),
            category: editing.category,
            description: editing.description,
            stock: String(editing.stock),
            imageDataUrl: editing.imageDataUrl,
          }
        : { ...blank(), category: categories[0] ?? '' }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      set('imageDataUrl', await resizeImageToDataUrl(file, 700, 700, 0.8));
    } catch {
      showToast('That image could not be read. Try another file.', 'error');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const name = form.name.trim();
    const price = Number(form.price);
    const stock = form.stock.trim() === '' ? 0 : Number(form.stock);

    if (!name) { showToast('Give the product a name.', 'error'); return; }
    if (!Number.isFinite(price) || price < 0) { showToast('Enter a price of 0 or more.', 'error'); return; }
    if (!Number.isFinite(stock) || stock < 0) { showToast('Stock must be 0 or more.', 'error'); return; }

    // Every product belongs to a category — resolve it (creating one if the
    // vendor typed a new name) before anything is written.
    let category = form.category;
    if (creating) {
      const clean = cleanCategoryName(newCategory);
      if (!clean) { showToast('Name the category this product belongs to.', 'error'); return; }
      if (clean.length > CATEGORY_MAX_LENGTH) {
        showToast(`Keep category names under ${CATEGORY_MAX_LENGTH} characters.`, 'error');
        return;
      }
      const existing = categories.find((c) => categoryKey(c) === categoryKey(clean));
      if (existing) {
        // Same category under a different casing — reuse it rather than refusing.
        category = existing;
      } else {
        if (categories.length >= CATEGORY_LIMIT) {
          showToast(`That's the limit of ${CATEGORY_LIMIT} categories.`, 'error');
          return;
        }
        setSaving(true);
        await onAddCategory(clean);
        category = clean;
      }
    } else if (!category) {
      showToast('Pick a category for this product.', 'error');
      return;
    }

    setSaving(true);
    await onSave({
      id: editing?.id,
      name,
      price,
      category,
      description: form.description.trim(),
      stock: Math.round(stock),
      imageDataUrl: form.imageDataUrl,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="wide"
      title={editing ? 'Edit product' : 'Add a product'}
      subtitle={editing ? undefined : 'This appears on your storefront as soon as you save.'}
      footer={
        <>
          <button type="button" className="btn-quiet" onClick={onClose}>Cancel</button>
          <button type="submit" form="product-form" className="btn-solid" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
          </button>
        </>
      }
    >
      <form id="product-form" className="form" onSubmit={submit}>
        <div className="form-photo">
          <div className="form-photo-preview">
            {form.imageDataUrl
              ? <img src={form.imageDataUrl} alt="" />
              : <Icon name="box" size={22} />}
          </div>
          <div className="form-photo-actions">
            <label className="btn-quiet btn-file">
              {form.imageDataUrl ? 'Replace photo' : 'Upload photo'}
              <input type="file" accept="image/*" onChange={handleImage} />
            </label>
            {form.imageDataUrl && (
              <button type="button" className="btn-link-danger" onClick={() => set('imageDataUrl', undefined)}>
                Remove
              </button>
            )}
            <p className="form-hint">A square photo looks best. It's compressed before saving.</p>
          </div>
        </div>

        <label className="field">
          <span>Product name</span>
          <input
            type="text"
            value={form.name}
            maxLength={PRODUCT_NAME_MAX}
            placeholder="e.g. Teak dining chair"
            onChange={(e) => set('name', e.target.value)}
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Price (₹)</span>
            <input type="number" min="0" step="1" inputMode="decimal" value={form.price}
              placeholder="1200" onChange={(e) => set('price', e.target.value)} />
          </label>
          <label className="field">
            <span>Stock</span>
            <input type="number" min="0" step="1" inputMode="numeric" value={form.stock}
              placeholder="0" onChange={(e) => set('stock', e.target.value)} />
          </label>
        </div>

        {creating ? (
          <div className="field">
            {/* The button stays outside the label — clicking a label forwards
                the click to its control, which would swallow it. */}
            <label>
              <span>New category</span>
              <input
                type="text"
                value={newCategory}
                maxLength={CATEGORY_MAX_LENGTH}
                placeholder="e.g. Chairs"
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </label>
            <p className="form-hint">
              {categories.length === 0
                ? 'Every product needs a category — this one is created with the product.'
                : 'Added to your categories when you save.'}
            </p>
            {categories.length > 0 && (
              <button type="button" className="btn-link" onClick={() => setCreating(false)}>
                Choose an existing category instead
              </button>
            )}
          </div>
        ) : (
          <label className="field">
            <span>Category</span>
            <select
              value={form.category}
              onChange={(e) => {
                if (e.target.value === NEW_CATEGORY) { setCreating(true); return; }
                set('category', e.target.value);
              }}
            >
              <option value="">Choose a category…</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value={NEW_CATEGORY}>+ New category…</option>
            </select>
          </label>
        )}

        <label className="field">
          <span>Description</span>
          <textarea
            rows={4}
            maxLength={PRODUCT_DESCRIPTION_MAX}
            value={form.description}
            placeholder="Materials, size, how it's made, delivery — whatever a buyer would ask."
            onChange={(e) => set('description', e.target.value)}
          />
          <span className="field-counter">{form.description.length}/{PRODUCT_DESCRIPTION_MAX}</span>
        </label>
      </form>
    </Modal>
  );
};

export default ProductFormModal;

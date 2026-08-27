import React, { useRef, useState } from 'react';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import { useToast } from '../../context/ToastContext';
import { resizeImageToDataUrl } from '../../utils/image';
import {
  CATEGORY_LIMIT,
  CATEGORY_MAX_LENGTH,
  categoryKey,
  cleanCategoryName,
  type ShopCategory,
} from '../../utils/categories';

interface CategoriesModalProps {
  open: boolean;
  categories: ShopCategory[];
  usageCount: (name: string) => number;
  onClose: () => void;
  onSave: (categories: ShopCategory[]) => Promise<boolean>;
}

const CategoriesModal: React.FC<CategoriesModalProps> = ({ open, categories, usageCount, onClose, onSave }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  // One shared file input, retargeted at whichever category is being re-photographed.
  const replaceRef = useRef<HTMLInputElement>(null);
  const replacingRef = useRef<string | null>(null);

  const commit = async (next: ShopCategory[]) => {
    setBusy(true);
    await onSave(next);
    setBusy(false);
  };

  const readImage = async (file: File) => {
    try {
      return await resizeImageToDataUrl(file, 400, 400, 0.8);
    } catch {
      showToast('That image could not be read. Try another file.', 'error');
      return undefined;
    }
  };

  const add = async () => {
    const clean = cleanCategoryName(name);
    if (!clean) return;
    if (clean.length > CATEGORY_MAX_LENGTH) { showToast(`Keep names under ${CATEGORY_MAX_LENGTH} characters.`, 'error'); return; }
    if (categories.some((c) => categoryKey(c.name) === categoryKey(clean))) {
      showToast(`“${clean}” is already one of your categories.`, 'error'); return;
    }
    if (categories.length >= CATEGORY_LIMIT) { showToast(`That's the limit of ${CATEGORY_LIMIT} categories.`, 'error'); return; }

    setName('');
    setImage(undefined);
    await commit([...categories, image ? { name: clean, imageDataUrl: image } : { name: clean }]);
  };

  const remove = async (target: string) => {
    const inUse = usageCount(target);
    if (inUse > 0) {
      showToast(
        inUse === 1
          ? `1 product still uses “${target}”. Move it to another category first.`
          : `${inUse} products still use “${target}”. Move them to another category first.`,
        'error'
      );
      return;
    }
    await commit(categories.filter((c) => c.name !== target));
  };

  const onReplacementChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = replacingRef.current;
    e.target.value = '';
    if (!file || !target) return;
    const dataUrl = await readImage(file);
    if (!dataUrl) return;
    await commit(categories.map((c) => (c.name === target ? { ...c, imageDataUrl: dataUrl } : c)));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Categories"
      subtitle="Group what you sell. Buyers filter by these on your storefront."
      footer={<button type="button" className="btn-solid" onClick={onClose}>Done</button>}
    >
      <div className="cat-add">
        <div className="cat-add-photo">
          {image ? <img src={image} alt="" /> : <span aria-hidden="true">+</span>}
          <input
            type="file"
            accept="image/*"
            aria-label="Photo for the new category"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) setImage(await readImage(file));
            }}
          />
        </div>
        <input
          type="text"
          className="cat-add-name"
          value={name}
          maxLength={CATEGORY_MAX_LENGTH}
          placeholder="e.g. Chairs"
          aria-label="New category name"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void add(); } }}
        />
        <button type="button" className="btn-solid" onClick={() => void add()} disabled={busy || !cleanCategoryName(name)}>
          Add
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="cat-empty">No categories yet — add your first one above.</p>
      ) : (
        <ul className="cat-list">
          {categories.map((category) => {
            const used = usageCount(category.name);
            return (
              <li key={category.name} className="cat-row">
                <button
                  type="button"
                  className="cat-thumb"
                  disabled={busy}
                  title={category.imageDataUrl ? 'Replace photo' : 'Add a photo'}
                  aria-label={`${category.imageDataUrl ? 'Replace' : 'Add'} photo for ${category.name}`}
                  onClick={() => { replacingRef.current = category.name; replaceRef.current?.click(); }}
                >
                  {category.imageDataUrl ? <img src={category.imageDataUrl} alt="" /> : <Icon name="grid" size={15} />}
                  <span className="cat-thumb-hint" aria-hidden="true">+</span>
                </button>

                <div className="cat-row-main">
                  <span className="cat-row-name">{category.name}</span>
                  <span className="cat-row-meta">
                    {used === 0 ? 'No products yet' : `${used} product${used === 1 ? '' : 's'}`}
                    {!category.imageDataUrl && ' · no photo'}
                  </span>
                </div>

                <button
                  type="button"
                  className="icon-btn icon-btn-round icon-btn-danger"
                  aria-label={`Remove ${category.name}`}
                  disabled={busy}
                  onClick={() => remove(category.name)}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <input ref={replaceRef} type="file" accept="image/*" hidden onChange={onReplacementChosen} />
    </Modal>
  );
};

export default CategoriesModal;

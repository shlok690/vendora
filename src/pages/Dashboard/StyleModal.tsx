import React, { useState } from 'react';
import Modal from '../../components/Modal';
import UiStylePicker from '../../components/UiStylePicker';
import { normalizeUiStyle, type UiStyle } from '../../utils/uiStyle';

interface StyleModalProps {
  open: boolean;
  uiStyle?: string;
  onClose: () => void;
  onChange: (style: UiStyle) => Promise<boolean>;
}

const StyleModal: React.FC<StyleModalProps> = ({ open, uiStyle, onClose, onChange }) => {
  const [busy, setBusy] = useState(false);
  const current = normalizeUiStyle(uiStyle);

  const pick = async (style: UiStyle) => {
    if (style === current || busy) return;
    setBusy(true);
    await onChange(style);
    setBusy(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Storefront style"
      subtitle="Your products, photos and colours stay the same — only the layout and typography change."
      footer={<button type="button" className="btn-solid" onClick={onClose}>Done</button>}
    >
      <UiStylePicker value={current} onChange={pick} disabled={busy} />
    </Modal>
  );
};

export default StyleModal;

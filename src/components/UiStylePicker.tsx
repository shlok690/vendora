import React from 'react';
import { UI_STYLES, type UiStyle } from '../utils/uiStyle';
import './UiStylePicker.css';

interface UiStylePickerProps {
  value: UiStyle;
  onChange: (style: UiStyle) => void;
  disabled?: boolean;
}

/** The three storefront looks, shown as miniature pages rather than named options. */
const UiStylePicker: React.FC<UiStylePickerProps> = ({ value, onChange, disabled }) => (
  <div className="ui-style-picker" role="radiogroup" aria-label="Storefront style">
    {UI_STYLES.map((style) => {
      const selected = value === style.id;
      return (
        <button
          key={style.id}
          type="button"
          role="radio"
          aria-checked={selected}
          disabled={disabled}
          className={`ui-style-option${selected ? ' selected' : ''}`}
          onClick={() => onChange(style.id)}
        >
          {/* A tiny mock of the storefront: hero band, then a product grid. */}
          <span className={`ui-style-preview ui-style-preview-${style.id}`} aria-hidden="true">
            <span
              className="ui-style-hero"
              style={{ background: `linear-gradient(135deg, ${style.swatch[0]}, ${style.swatch[1]})` }}
            >
              <span className="ui-style-mark" />
              <span className="ui-style-lines">
                <i /><i />
              </span>
            </span>
            <span className="ui-style-grid">
              <i /><i /><i /><i />
            </span>
          </span>

          <span className="ui-style-text">
            <span className="ui-style-label">{style.label}</span>
            <span className="ui-style-tagline">{style.tagline}</span>
          </span>

          <span className="ui-style-tick" aria-hidden="true">✓</span>
        </button>
      );
    })}
  </div>
);

export default UiStylePicker;

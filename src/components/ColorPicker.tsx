import React, { useRef } from 'react';
import { DEFAULT_THEME_COLOR } from '../utils/onboardingDraft';
import { hexToRgb, hsvToRgb, rgbToHex, rgbToHsv } from '../utils/color';

/** The starting palette offered under the picker. */
export const THEME_PRESETS = [
  DEFAULT_THEME_COLOR,
  '#c1553a',
  '#7c3aed',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#0891b2',
  '#db2777',
];

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

/** Saturation/value square beside a hue bar, both drag-driven. */
const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const [h, s, v] = rgbToHsv(...hexToRgb(value));

  const fromSv = (clientX: number, clientY: number) => {
    const box = svRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    onChange(rgbToHex(...hsvToRgb(h, x, 1 - y)));
  };

  const fromHue = (clientY: number) => {
    const bar = hueRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    onChange(rgbToHex(...hsvToRgb(y * 360, s, v)));
  };

  const hueColor = `rgb(${hsvToRgb(h, 1, 1).map((n) => Math.round(n)).join(',')})`;

  return (
    <div className="wizard-color-picker">
      <div
        ref={svRef}
        className="wizard-sv-box"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})` }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromSv(e.clientX, e.clientY); }}
        onPointerMove={(e) => { if (e.buttons === 1) fromSv(e.clientX, e.clientY); }}
      >
        <div className="wizard-sv-thumb" style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%`, background: value }} />
      </div>
      <div
        ref={hueRef}
        className="wizard-hue-bar"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromHue(e.clientY); }}
        onPointerMove={(e) => { if (e.buttons === 1) fromHue(e.clientY); }}
      >
        <div className="wizard-hue-thumb" style={{ top: `${(h / 360) * 100}%` }} />
      </div>
    </div>
  );
};

export default ColorPicker;

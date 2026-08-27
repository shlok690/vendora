/**
 * The look a vendor picks for their storefront.
 *
 * This replaces the old `layoutStyle` (Gallery / Logo / Cover banner), which
 * only nudged the hero around. A style here changes the whole page — typography,
 * density, corners, shadows and grid — so vendors get three genuinely different
 * storefronts rather than three arrangements of one.
 */

export type UiStyle = 'compact' | 'funky' | 'sober';

export const DEFAULT_UI_STYLE: UiStyle = 'compact';

export interface UiStyleOption {
  id: UiStyle;
  label: string;
  tagline: string;
  /** Two-tone swatch for the picker, so the choice is visible before committing. */
  swatch: [string, string];
}

export const UI_STYLES: UiStyleOption[] = [
  {
    id: 'compact',
    label: 'Compact & simple',
    tagline: 'Tight grid, plain type, everything close together. Best for a big catalogue.',
    swatch: ['#f2ebe1', '#191410'],
  },
  {
    id: 'funky',
    label: 'Funky & modern',
    tagline: 'Big colour, rounded corners, oversized headings. Best for a bold brand.',
    swatch: ['#c1553a', '#e0a32e'],
  },
  {
    id: 'sober',
    label: 'Simple & sober',
    tagline: 'Airy spacing, serif headings, almost no colour. Best for craft and premium goods.',
    swatch: ['#faf6f0', '#2e5e4e'],
  },
];

const VALID: UiStyle[] = ['compact', 'funky', 'sober'];

/** Falls back for old profiles, which carried a `layoutStyle` instead. */
export const normalizeUiStyle = (value: unknown): UiStyle =>
  VALID.includes(value as UiStyle) ? (value as UiStyle) : DEFAULT_UI_STYLE;

export const uiStyleLabel = (style: UiStyle) =>
  UI_STYLES.find((s) => s.id === style)?.label ?? UI_STYLES[0].label;
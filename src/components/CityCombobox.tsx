import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';
import { INDIAN_CITIES } from '../constants/cities';
import { rankCities } from '../utils/citySearch';
import './CityCombobox.css';

interface CityComboboxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Location picker: a scrollable list of Indian cities that narrows to the
 * closest matches as you type. Replaces a native <datalist>, which can't be
 * scrolled open on demand and is styled inconsistently across browsers.
 */
const CityCombobox: React.FC<CityComboboxProps> = ({ id, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Keep in step when the field is filled from elsewhere (a restored draft).
  useEffect(() => { setQuery(value); }, [value]);

  const matches = useMemo(() => rankCities(query, INDIAN_CITIES), [query]);

  useEffect(() => { setHighlight(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the highlighted row inside the scroll box while arrowing through.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const row = listRef.current.children[highlight] as HTMLElement | undefined;
    row?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  const commit = (city: string) => {
    onChange(city);
    setQuery(city);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      if (matches.length === 0) return;
      setHighlight((h) => (e.key === 'ArrowDown'
        ? (h + 1) % matches.length
        : (h - 1 + matches.length) % matches.length));
      return;
    }
    if (e.key === 'Enter' && open && matches[highlight]) {
      e.preventDefault();
      commit(matches[highlight]);
      return;
    }
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="city-combobox" ref={rootRef}>
      <div className={`city-combobox-field${open ? ' open' : ''}`}>
        <Icon name="pin" size={16} className="city-combobox-pin" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="city-combobox-list"
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="city-combobox-toggle"
          aria-label={open ? 'Hide city list' : 'Show city list'}
          tabIndex={-1}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {open && (
        <ul className="city-combobox-list" id="city-combobox-list" role="listbox" ref={listRef}>
          {matches.length === 0 ? (
            <li className="city-combobox-empty">
              No Indian city matches “{query.trim()}”. You can still type it in.
            </li>
          ) : (
            matches.map((city, i) => (
              <li
                key={city}
                role="option"
                aria-selected={city === value}
                className={`city-combobox-option${i === highlight ? ' active' : ''}${city === value ? ' selected' : ''}`}
                onPointerDown={(e) => { e.preventDefault(); commit(city); }}
                onMouseEnter={() => setHighlight(i)}
              >
                {city}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default CityCombobox;

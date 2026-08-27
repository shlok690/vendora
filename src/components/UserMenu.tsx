import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import './UserMenu.css';

interface UserMenuProps {
  name: string;
  email?: string;
  /** Shown inside the dropdown — the header itself stays uncluttered. */
  roleLabel: string;
  onLogout: () => void;
  /** Real href rather than a click handler, so it still works if React's
   *  event handling is wedged and the browser falls back to the anchor. */
  viewSiteTo: string;
  /** Opens the shop-details form; omitted for roles that have no shop. */
  onShopDetails?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ name, email, roleLabel, onLogout, viewSiteTo, onShopDetails }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // The pill shows a first name so it never truncates; the dropdown carries the full identity.
  const shortName = name.trim().split(/\s+/)[0] || name;

  const run = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        type="button"
        className={`user-menu-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
      >
        <span className="user-menu-name">{shortName}</span>
        <svg className="user-menu-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-card">
            <div className="user-menu-card-text">
              <div className="user-menu-card-name">{name}</div>
              {email && <div className="user-menu-card-email">{email}</div>}
              <span className="user-menu-role">{roleLabel}</span>
            </div>
          </div>

          {onShopDetails && (
            <button type="button" role="menuitem" className="user-menu-item" onClick={run(onShopDetails)}>
              <Icon name="gear" size={16} />
              Shop details
            </button>
          )}

          {/* On a phone the header has no room for a separate button, so the same
              destination lives here instead. */}
          <Link to={viewSiteTo} role="menuitem" className="user-menu-item user-menu-item-mobile" onClick={() => setOpen(false)}>
            <Icon name="storefront" size={16} />
            View your site
          </Link>

          <button type="button" role="menuitem" className="user-menu-item user-menu-item-danger" onClick={run(onLogout)}>
            <Icon name="logout" size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

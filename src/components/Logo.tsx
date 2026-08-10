import React from 'react';

interface LogoProps {
  /** Font size (px) of the "Vendora" wordmark — the icon scales to match. */
  size?: number;
  className?: string;
}

const NAVY = '#0a0a2e';

const Logo: React.FC<LogoProps> = ({ size = 28, className }) => {
  const iconSize = Math.round(size * 1.2);

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.28), lineHeight: 1 }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 6 L36 6 L42 18 L42 22 L6 22 L6 18 Z" stroke={NAVY} strokeWidth="3" strokeLinejoin="round" />
        <path d="M18 8 L18 22" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
        <path d="M30 8 L30 22" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
        <path d="M10 22 L10 34 L38 34 L38 22" stroke={NAVY} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M19 34 L19 25 L29 25 L29 34" stroke={NAVY} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: size, fontWeight: 900, letterSpacing: '-0.02em', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <span style={{ color: NAVY }}>Vend</span>
        <span
          style={{
            background: 'linear-gradient(135deg, #4f5bd5, #7b86e8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ora
        </span>
      </span>
    </span>
  );
};

export default Logo;
